import React, { useState, useEffect, useMemo, useRef } from 'react';
import classNames from 'classnames';
import { basicSetup } from 'codemirror';
import type { CompletionContext } from '@codemirror/autocomplete';
import { indentWithTab } from '@codemirror/commands';
import { json, jsonLanguage, jsonParseLinter } from '@codemirror/lang-json';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { type Diagnostic, forceLinting, linter, lintGutter } from '@codemirror/lint';
import { Annotation, EditorState, StateEffect, StateField, Text } from '@codemirror/state';
import { EditorView, keymap } from '@codemirror/view';
import { tags } from '@lezer/highlight';
import { indentationMarkers } from '@replit/codemirror-indentation-markers';
import { useTranslation } from 'react-i18next';
import { ActionableNotification, FeatureFlags, IconButton } from '@carbon/react';
import { useStandardFormSchema } from '@hooks/useStandardFormSchema';
import Ajv from 'ajv';
import debounce from 'lodash-es/debounce';
import { ChevronRight, ChevronLeft } from '@carbon/react/icons';
import type { SchemaError } from '@types';
import { completeFromSchema } from './schema-completions';
import { findDuplicateKeys } from './duplicate-keys';
import { createInstanceLineFinder } from './schema-error-line';
import styles from './schema-editor.scss';

interface SchemaEditorProps {
  isLoading?: boolean;
  validationOn: boolean;
  onSchemaChange: (stringifiedSchema: string) => void;
  stringifiedSchema: string;
  errors: Array<SchemaError>;
  setErrors: (errors: Array<SchemaError>) => void;
  setValidationOn: (validationStatus: boolean) => void;
}

/** Marks the transactions that load the `stringifiedSchema` prop, so they aren't reported back as edits. */
const loadSchema = Annotation.define<boolean>();

/** Replaces the schema errors the editor shows as diagnostics. */
const setSchemaErrors = StateEffect.define<Array<SchemaError>>();

const schemaErrorsField = StateField.define<Array<SchemaError>>({
  create: () => [],
  update: (schemaErrors, transaction) =>
    transaction.effects.reduce((value, effect) => (effect.is(setSchemaErrors) ? effect.value : value), schemaErrors),
});

// Carbon's support-error red, written out because the lint icons are data URLs, which can't read CSS custom properties.
const errorRed = '#da1e28';
// Carbon's support-warning yellow, and its yellow 60, which keeps at least 3:1 contrast where yellow 30 can't.
const warningYellow = '#f1c21b';
const warningYellowDark = '#8e6a00';

function svgDataUrl(content: string, attributes = 'viewBox="0 0 40 40"') {
  return `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" ${attributes}>${encodeURIComponent(content)}</svg>')`;
}

/**
 * Follows the surrounding Carbon theme through its CSS custom properties, falling back to the white theme's values
 * because the app shell doesn't define the properties globally.
 */
const carbonTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--cds-background, #ffffff)',
    color: 'var(--cds-text-primary, #161616)',
    fontSize: '0.9375rem',
  },
  // Carbon's monospace stack, from @carbon/type.
  '.cm-scroller': {
    fontFamily: "'IBM Plex Mono', 'Menlo', 'DejaVu Sans Mono', 'Bitstream Vera Sans Mono', Courier, monospace",
  },
  '.cm-content': { caretColor: 'var(--cds-text-primary, #161616)' },
  '.cm-cursor, .cm-dropCursor': { borderLeftColor: 'var(--cds-text-primary, #161616)' },
  '.cm-gutters': {
    backgroundColor: 'var(--cds-layer-01, #f4f4f4)',
    color: 'var(--cds-text-secondary, #525252)',
    borderRight: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
  },
  '.cm-activeLine': { backgroundColor: 'var(--cds-layer-hover-01, #e8e8e8)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--cds-layer-hover-01, #e8e8e8)' },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, ::selection': {
    backgroundColor: 'var(--cds-highlight, #d0e2ff)',
  },
  '.cm-tooltip': {
    backgroundColor: 'var(--cds-layer-01, #f4f4f4)',
    color: 'var(--cds-text-primary, #161616)',
    border: '1px solid var(--cds-border-subtle-01, #c6c6c6)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--cds-layer-selected-01, #e0e0e0)',
    color: 'var(--cds-text-primary, #161616)',
  },
  // CodeMirror's default lint reds drop below 3:1 contrast on the gutter and the active line.
  '.cm-lintRange-error': {
    backgroundImage: svgDataUrl(
      `<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${errorRed}" fill="none" stroke-width="1"/>`,
      'width="6" height="3"',
    ),
  },
  '.cm-lint-marker-error': {
    content: svgDataUrl(`<circle cx="20" cy="20" r="15" fill="${errorRed}"/>`),
  },
  '.cm-diagnostic-error': { borderLeftColor: `var(--cds-support-error, ${errorRed})` },
  // CodeMirror's default lint orange is below 2:1 contrast on the background.
  '.cm-lintRange-warning': {
    backgroundImage: svgDataUrl(
      `<path d="m0 2.5 l2 -1.5 l1 0 l2 1.5 l1 0" stroke="${warningYellowDark}" fill="none" stroke-width="1"/>`,
      'width="6" height="3"',
    ),
  },
  '.cm-lint-marker-warning': {
    content: svgDataUrl(
      `<path d="M20 6L37 35L3 35Z" fill="${warningYellow}" stroke="${warningYellowDark}" stroke-width="4" stroke-linejoin="round"/>`,
    ),
  },
  '.cm-diagnostic-warning': { borderLeftColor: `var(--cds-support-warning, ${warningYellow})` },
});

const jsonHighlighting = HighlightStyle.define([
  { tag: tags.propertyName, class: styles.property },
  { tag: tags.string, class: styles.string },
  { tag: [tags.number, tags.bool, tags.null], class: styles.literal },
  { tag: [tags.brace, tags.squareBracket, tags.separator, tags.punctuation], class: styles.punctuation },
]);

/** Places each schema error on its line, kept within the document in case it has since got shorter. */
function toDiagnostics(state: EditorState, errors: Array<SchemaError>): Array<Diagnostic> {
  return errors.map(({ line, message }) => {
    const { from, to } = state.doc.line(Math.min(Math.max(line, 1), state.doc.lines));
    return { from, to, severity: 'error', message };
  });
}

/** Puts the cursor at the start of a line and scrolls it into the middle of the editor. */
function goToLine(view: EditorView, line: number) {
  const { from } = view.state.doc.line(Math.min(Math.max(line, 1), view.state.doc.lines));
  view.dispatch({ selection: { anchor: from }, effects: EditorView.scrollIntoView(from, { y: 'center' }) });
}

const SchemaEditor: React.FC<SchemaEditorProps> = ({
  onSchemaChange,
  stringifiedSchema,
  setErrors,
  errors,
  validationOn,
  setValidationOn,
}) => {
  const { schema } = useStandardFormSchema();
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  // Texts the editor has reported through onSchemaChange that haven't come back as stringifiedSchema yet
  const unconfirmedEditsRef = useRef<Array<string>>([]);
  const previousErrorButtonRef = useRef<HTMLButtonElement>(null);
  const nextErrorButtonRef = useRef<HTMLButtonElement>(null);
  const [focusTarget, setFocusTarget] = useState<'previous' | 'next' | null>(null);

  // Validate JSON schema
  const validateSchema = (content: string, schema) => {
    try {
      const trimmedContent = content.replace(/\s/g, '');
      // Check if the content is an empty object
      if (trimmedContent.trim() === '{}') {
        // Reset errors since the JSON is considered valid
        setErrors([]);
        return;
      }

      const ajv = new Ajv({ allErrors: true, jsPropertySyntax: true, strict: false });
      const validate = ajv.compile(schema);
      const parsedContent = JSON.parse(content);
      const isValid = validate(parsedContent);

      if (!isValid) {
        const findLine = createInstanceLineFinder(content);
        const schemaErrors = validate.errors.map((error) => {
          const line = findLine(
            error.instancePath,
            error.keyword === 'additionalProperties' ? error.params.additionalProperty : undefined,
          );
          const pathSegments = error.instancePath.split('.'); // Split the path into segments
          const errorPropertyName = pathSegments[pathSegments.length - 1];
          const message =
            error.keyword === 'type' || error.keyword === 'enum'
              ? `${errorPropertyName.charAt(0).toUpperCase() + errorPropertyName.slice(1)} ${error.message}`
              : `${error.message.charAt(0).toUpperCase() + error.message.slice(1)}`;

          return { line, message };
        });

        // The previous errors may have been fewer, so the list starts over at the first error
        setCurrentIndex(0);
        setErrors(schemaErrors);
      } else {
        setErrors([]);
      }
    } catch (error) {
      // Errors from the last valid text would point at text that has since changed. The editor flags the JSON
      // syntax error itself.
      setErrors([]);
      console.error('Error parsing or validating JSON:', error);
    }
  };

  const handleChange = (newValue: string) => {
    setValidationOn(false);
    setCurrentIndex(0);
    onSchemaChange(newValue);
    debouncedValidateSchema(newValue, schema);
  };

  // The editor is created once, so its extensions reach the latest props and callbacks through these refs.
  const validateSchemaRef = useRef(validateSchema);
  const handleChangeRef = useRef(handleChange);
  const schemaRef = useRef(schema);

  useEffect(() => {
    validateSchemaRef.current = validateSchema;
    handleChangeRef.current = handleChange;
    schemaRef.current = schema;
  });

  const debouncedValidateSchema = useMemo(
    () => debounce((content: string, schema) => validateSchemaRef.current(content, schema), 300),
    [],
  );

  useEffect(() => () => debouncedValidateSchema.cancel(), [debouncedValidateSchema]);

  useEffect(() => {
    const view = new EditorView({
      parent: containerRef.current,
      state: EditorState.create({
        doc: stringifiedSchema ?? '',
        extensions: [
          basicSetup,
          keymap.of([indentWithTab]),
          indentationMarkers({
            colors: {
              light: 'var(--cds-border-subtle-00, #e0e0e0)',
              activeLight: 'var(--cds-border-strong-01, #8d8d8d)',
            },
          }),
          json(),
          jsonLanguage.data.of({
            autocomplete: (context: CompletionContext) => completeFromSchema(context, schemaRef.current),
          }),
          schemaErrorsField,
          linter(
            (view) => [
              ...(view.state.doc.toString().trim() ? jsonParseLinter()(view) : []),
              ...toDiagnostics(view.state, view.state.field(schemaErrorsField)),
              ...findDuplicateKeys(view.state).map(
                ({ from, to, name, lineOfLast }): Diagnostic => ({
                  from,
                  to,
                  severity: 'warning',
                  message: t('duplicateKey', '"{{name}}" is set again on line {{line}}, so this value is ignored', {
                    name,
                    line: lineOfLast,
                    interpolation: { escapeValue: false },
                  }),
                }),
              ),
            ],
            {
              needsRefresh: (update) =>
                update.transactions.some((transaction) =>
                  transaction.effects.some((effect) => effect.is(setSchemaErrors)),
                ),
            },
          ),
          lintGutter(),
          syntaxHighlighting(jsonHighlighting),
          carbonTheme,
          EditorState.tabSize.of(2),
          EditorView.contentAttributes.of({ 'aria-label': t('schemaEditor', 'Schema editor') }),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(loadSchema))) {
              const text = update.state.doc.toString();
              unconfirmedEditsRef.current.push(text);
              handleChangeRef.current(text);
            }
          }),
        ],
      }),
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // The editor owns its document after creation. Later schema changes are loaded by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    const text = stringifiedSchema ?? '';

    // When edits arrive faster than the parent re-renders, it can pass back an edit the editor has since moved past.
    // That isn't a change from outside, so the newer text stays.
    const confirmed = unconfirmedEditsRef.current.indexOf(text);
    if (confirmed !== -1) {
      unconfirmedEditsRef.current = unconfirmedEditsRef.current.slice(confirmed + 1);
      return;
    }
    unconfirmedEditsRef.current = [];

    if (view && text !== view.state.doc.toString()) {
      // Keeps the cursor on the same line and column, as far as the new text allows
      const { head } = view.state.selection.main;
      const cursorLine = view.state.doc.lineAt(head);
      const newDoc = Text.of(text.split('\n'));
      const newLine = newDoc.line(Math.min(cursorLine.number, newDoc.lines));

      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: text },
        selection: { anchor: Math.min(newLine.from + head - cursorLine.from, newLine.to) },
        annotations: loadSchema.of(true),
      });

      // Errors shown for the old text may no longer apply, for example after a fix in the interactive builder
      if (view.state.field(schemaErrorsField).length) {
        debouncedValidateSchema(text, schema);
      }
    }
  }, [stringifiedSchema, schema, debouncedValidateSchema]);

  // Shows the schema errors as diagnostics in the editor
  useEffect(() => {
    const view = viewRef.current;
    if (view) {
      view.dispatch({ effects: setSchemaErrors.of(errors) });
      forceLinting(view);
    }
  }, [errors]);

  const goToError = (index: number) => {
    setCurrentIndex(index);
    if (viewRef.current && errors[index]) {
      goToLine(viewRef.current, errors[index].line);
    }
  };

  // A button that reaches the first or last error is disabled and loses focus, so focus moves to the other button
  // once it's enabled, the way Carbon's Pagination does
  useEffect(() => {
    if (focusTarget) {
      (focusTarget === 'previous' ? previousErrorButtonRef : nextErrorButtonRef).current?.focus();
      setFocusTarget(null);
    }
  }, [focusTarget]);

  const goToPreviousError = () => {
    const index = Math.max(currentIndex - 1, 0);
    goToError(index);
    if (index === 0) {
      setFocusTarget('next');
    }
  };

  const goToNextError = () => {
    const index = Math.min(currentIndex + 1, errors.length - 1);
    goToError(index);
    if (index === errors.length - 1) {
      setFocusTarget('previous');
    }
  };

  const currentError = errors[currentIndex];

  return (
    <div>
      {errors.length && validationOn ? (
        <div className={styles.validationErrorsContainer}>
          {/* Without this flag, Carbon adds two tabbable "Focus sentinel" links to the notification for a focus
              trap that role="status" turns off */}
          <FeatureFlags enableExperimentalFocusWrapWithoutSentinels>
            <ActionableNotification
              subtitle={
                <>
                  <button
                    type="button"
                    className={styles.errorLine}
                    onClick={() => {
                      goToError(currentIndex);
                      viewRef.current?.focus();
                    }}
                  >
                    {`${t('errorOnLine', 'Error on line')} ${currentError?.line}:`}
                  </button>{' '}
                  {currentError?.message}
                </>
              }
              inline
              kind="error"
              lowContrast
              // The default alertdialog role traps focus in the notification and takes it back on every render, which
              // would keep keyboard users from the previous and next error buttons
              role="status"
              actionButtonLabel={t('viewReferenceSchema', 'View reference schema')}
              onActionButtonClick={() =>
                window.open('https://json.openmrs.org/form.schema.json', '_blank', 'noopener,noreferrer')
              }
            />
          </FeatureFlags>
          <div className={styles.pagination}>
            <IconButton
              kind="ghost"
              size="sm"
              label={t('previousError', 'Previous error')}
              disabled={currentIndex === 0}
              onClick={goToPreviousError}
              ref={previousErrorButtonRef}
            >
              <ChevronLeft />
            </IconButton>
            <div>
              {currentIndex + 1}/{errors.length}
            </div>
            <IconButton
              kind="ghost"
              size="sm"
              label={t('nextError', 'Next error')}
              disabled={currentIndex === errors.length - 1}
              onClick={goToNextError}
              ref={nextErrorButtonRef}
            >
              <ChevronRight />
            </IconButton>
          </div>
        </div>
      ) : null}
      <div
        id="schemaEditor"
        className={classNames(styles.editor, { [styles.hasErrors]: errors.length })}
        ref={containerRef}
      />
    </div>
  );
};

export default SchemaEditor;
