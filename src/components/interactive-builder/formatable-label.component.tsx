import React, { type ReactNode, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import type { Editor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Heading from '@tiptap/extension-heading'
import type { Level } from "@tiptap/extension-heading";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Code from "@tiptap/extension-code";
import CodeBlock from "@tiptap/extension-code-block";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import { Dropdown, OverflowMenu, OverflowMenuItem } from "@carbon/react";
import { OverflowMenuHorizontal } from '@carbon/react/icons';
import {
  FaBold,
  FaItalic,
  FaRedo,
  FaUndo,
  FaCode,
  FaLink,
} from "react-icons/fa";
import styles from './formatable-label.scss';
import { useTranslation } from "react-i18next";

interface TextEditorProps {
  defaultValue?: string;
  labelText?: ReactNode;
  handleOnChange: (html) => void
}

interface HeadingOptionProps {
  id: string;
  text: string;
  level?: number;
  style?: React.CSSProperties;
}

interface MenuItemProps {
  onClick: () => void;
  label?: string;
  shortCut?: string;
}

const MoreFormattingOptions: React.FC<{ editor: Editor }> = ({ editor }) => {
  const menuItems: Array<MenuItemProps> = [
    {
      onClick: () => {
        const result: boolean = editor.chain().focus().toggleSubscript().run();
        return result;
      },
      label: "Subscript",
      shortCut: "Ctrl+Shift+,",
    },
    {
      onClick: () => {
        const result = editor.chain().focus().toggleSuperscript().run();
        return result;
      },
      label: "Superscript",
      shortCut: "Ctrl+Shift+.",
    },
    {
      onClick: () => {
        const result: boolean = editor.chain().focus().toggleUnderline().run();
        return result;
      },
      label: "Underline",
      shortCut: "Ctrl+U"
    },
    {
      onClick: () => {
        const result: boolean = editor.chain().focus().toggleStrike().run();
        return result;
      },
      label: "Strikethrough",
      shortCut: "Ctrl+S"
    },
    {
      onClick: () => {
        const result: boolean = editor.chain().focus().unsetAllMarks().clearNodes().run();
        return result;
      },
      label: "Clear Formatting",
      shortCut: "Ctrl+\\"
    },
  ];

  return (
    <>
      <OverflowMenu
        ariaLabel="More formatting options"
        iconDescription="More formatting options"
        flipped 
        align="left"
        size="sm"
        renderIcon={OverflowMenuHorizontal}
      >
        {menuItems.map((item, index) => (
          <OverflowMenuItem
            key={index}
            hasDivider
            aria-label={item.label}
            onClick={item.onClick}
            itemText={
              <span
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'space-between',
                minWidth: '100%'
              }}
              >
                <span>
                  {item.label}
                </span>
                <span
                style={{
                  borderRadius: '3px',
                  backgroundColor: 'rgba(223, 225, 229, 0.5)',
                  padding: '4px',
                  lineHeight: '12px',
                  fontSize: '0.729375rem',
                  color: '#505F79'
                }}
                >
                  {item.shortCut}
                </span>
              </span>
            }
          />
        ))}
      </OverflowMenu>
    </>
  );
};

const MenuBar: React.FC<{ editor: Editor }> = ( {editor} ) => {

  const [newSelectedItem, setNewSelectedItem] = useState<HeadingOptionProps>({
    id: 'normal',
    text: 'Normal text',
    level: 0,
    style: { fontSize: '1em', fontWeight: 'normal' },
  });

  if (!editor) {
    return null;
  }

  const headingOptions: Array<HeadingOptionProps> = [
    { id: 'normal', text: 'Normal text', level: 0, style: { fontSize: '1em', fontWeight: 'normal' } },
    { id: 'h1', text: 'Heading 1', level: 1, style: { fontSize: '2em', fontWeight: 'bold' } },
    { id: 'h2', text: 'Heading 2', level: 2, style: { fontSize: '1.5em', fontWeight: 'bold' } },
    { id: 'h3', text: 'Heading 3', level: 3, style: { fontSize: '1.17em', fontWeight: 'bold' } },
    { id: 'h4', text: 'Heading 4', level: 4, style: { fontSize: '1em', fontWeight: 'bold' } },
    { id: 'h5', text: 'Heading 5', level: 5, style: { fontSize: '0.83em', fontWeight: 'bold' } },
    { id: 'h6', text: 'Heading 6', level: 6, style: { fontSize: '0.67em', fontWeight: 'bold' } },
  ];

  const renderDropdownItem = (item: HeadingOptionProps) => {
    return (
      <div className={styles.dropdownItem}>
          <span style={item.style}>{item.text}</span>
          <span className={styles.shortCut}>{`Ctrl+Alt+${item.level}`}</span>
      </div>
    );
  };

  const handleHeadingChange = (selectedItem: HeadingOptionProps) => {
    setNewSelectedItem(selectedItem);

    if (selectedItem.id === 'normal') {
      editor.chain().focus().setParagraph().run();
    } else {
      editor.chain().focus().toggleHeading({ level: selectedItem.level as Level }).run();
    }
  };
  
  return (
    <div className={styles.editorMenuBar}>
      <Dropdown
        aria-label="Text styles"
        id="headingDropdown"
        autoAlign={true}
        className={styles.dropdown}
        direction='top'
        items={headingOptions}
        itemToString={(item: HeadingOptionProps) => item.text}
        itemToElement={(item) => renderDropdownItem(item as HeadingOptionProps)}
        initialSelectedItem={headingOptions[0]}
        selectedItem={newSelectedItem}
        onChange={({ selectedItem }) => handleHeadingChange(selectedItem as HeadingOptionProps)}
      />
      <span className={styles.divider}></span>
      <div className={styles.editButtons}>
        <button
          title="Bold Ctrl+B"
          onClick={() => {
            const result: boolean = editor.chain().focus().toggleBold().run();
            return result;
          }}
          className={editor.isActive("bold") ? "is_active" : ""}
        >
          <FaBold />
        </button>
        <button
          title="Italic Ctrl+I"
          onClick={() => {
            const result: boolean = editor.chain().focus().toggleItalic().run();
            return result;
          }}
          className={editor.isActive("italic") ? "is_active" : ""}
        >
          <FaItalic />
        </button>
        <MoreFormattingOptions editor={editor}/>
      </div>
      <span className={styles.divider}></span>
      <input
        title="Text color"
        type="color" 
        className={styles.colorInput} 
        onChange={(e) => {
          const result: boolean = editor.chain().focus().setColor(e.target.value).run();
          return result;
        }}
      />
      <span className={styles.divider}></span>
      <div className={styles.editButtons}>
        <button
         title="Code Ctrl+Shift+M" 
         onClick={() => {
          const result: boolean = editor.chain().focus().toggleCode().run();
          return result;
         }}>
          <FaCode />
        </button> 
        <button
          title="Link Ctrl+K"
          onClick={() => {
            const result: boolean = editor.chain().focus().toggleLink({ href: prompt('Enter URL') }).run();
            return result;
          }}>
          <FaLink />
        </button>
      </div>
      <span className={styles.divider}></span>
      <div className={styles.editButtons}>
        <button
          title="Undo Ctrl+Z"
          onClick={() => {
            const result: boolean = editor.chain().focus().undo().run();
            return result;
          }}>
          <FaUndo />
        </button>
        <button
          title="Redo Ctrl+Y"
          onClick={() => {
            const result: boolean = editor.chain().focus().redo().run();
            return result;
          }}>
          <FaRedo />
        </button>
      </div>
    </div>
  );
};
  
const FormatableLabel: React.FC<TextEditorProps> = ({defaultValue, labelText, handleOnChange }) => {
  const { t } = useTranslation();

  const extractTextFromHtml = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };
  
  const editor = useEditor({
    extensions: [
      StarterKit, 
      Underline,
      Subscript,
      Superscript,
      Heading.configure({
        levels: [1, 2, 3, 4, 5, 6],
      }),
      ...(defaultValue
        ? []
        : [
            Placeholder.configure({
              placeholder: t('labelPlaceholder', 'e.g. Type of Anaesthesia'),
            }),
          ]
      ),
      Link,
      Code,
      CodeBlock,
      TextStyle,
      Color
    ],

    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      handleOnChange(html);
    },
    ...(defaultValue && {
      content: extractTextFromHtml(defaultValue),
    }),
  });

  return (
    <div className={styles.questionLabel}>
      {labelText || <span className={styles.label}>{t('questionLabel', 'Label')}</span>}
      <div className={styles.textEditor}>
        <MenuBar editor={editor}/>
        <EditorContent editor={editor} className={styles.editorContent}/>
      </div>
    </div>
  )
}

export default FormatableLabel;