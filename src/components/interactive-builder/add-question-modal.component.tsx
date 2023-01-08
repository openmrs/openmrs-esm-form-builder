import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ComposedModal,
  Form,
  FormGroup,
  FormLabel,
  Layer,
  InlineLoading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  MultiSelect,
  RadioButton,
  RadioButtonGroup,
  Search,
  Select,
  SelectItem,
  Stack,
  Tag,
  TextInput,
  Tile,
} from "@carbon/react";
import flattenDeep from "lodash-es/flattenDeep";
import { showNotification, showToast, useConfig } from "@openmrs/esm-framework";
import {
  Answer,
  Concept,
  ConceptMapping,
  FieldTypes,
  Question,
  Schema,
} from "../../types";
import { useConceptLookup } from "../../hooks/useConceptLookup";
import styles from "./question-modal.scss";

type AddQuestionModalProps = {
  onModalChange: (showModal: boolean) => void;
  onQuestionEdit: (question: Question) => void;
  onSchemaChange: (schema: Schema) => void;
  pageIndex: number;
  questionIndex: number;
  questionToEdit: Question;
  resetIndices: () => void;
  schema: Schema;
  sectionIndex: number;
  showModal: boolean;
};

const AddQuestionModal: React.FC<AddQuestionModalProps> = ({
  schema,
  onSchemaChange,
  pageIndex,
  sectionIndex,
  questionIndex,
  resetIndices,
  showModal,
  onModalChange,
  questionToEdit,
  onQuestionEdit,
}) => {
  const { t } = useTranslation();
  const { fieldTypes, questionTypes } = useConfig();
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [questionLabel, setQuestionLabel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [isQuestionRequired, setIsQuestionRequired] = useState(false);
  const [fieldType, setFieldType] = useState<FieldTypes>(null);
  const [questionId, setQuestionId] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [conceptMappings, setConceptMappings] = useState<ConceptMapping[]>([]);
  const [rows, setRows] = useState(2);
  const [conceptToLookup, setConceptToLookup] = useState("");
  const [selectedAnswers, setSelectedAnswers] = useState([]);
  const { concepts, isLoadingConcepts } = useConceptLookup(conceptToLookup);

  const handleConceptChange = (event) => {
    setConceptToLookup(event.target.value);
  };

  const handleConceptSelect = (concept: Concept) => {
    setConceptToLookup("");
    setSelectedConcept(concept);
    setAnswers(
      concept?.answers?.map((answer) => ({
        concept: answer?.uuid,
        label: answer?.display,
      }))
    );
    setConceptMappings(
      concept?.mappings?.map((conceptMapping) => {
        let data = conceptMapping.display.split(": ");
        return { type: data[0], value: data[1] };
      })
    );
  };

  const questionIdExists = (idToTest) => {
    if (questionToEdit?.id === idToTest) {
      return false;
    }

    const nestedIds = schema?.pages?.map((page) => {
      return page?.sections?.map((section) => {
        return section?.questions?.map((question) => {
          return question.id;
        });
      });
    });

    const questionIds = flattenDeep(nestedIds);

    return questionIds.includes(idToTest);
  };

  const handleCreateQuestion = () => {
    createQuestion();
    onModalChange(false);
  };

  const createQuestion = () => {
    try {
      const computedQuestionId = `question-${questionIndex + 1}-section-${
        sectionIndex + 1
      }-page-${pageIndex + 1}`;

      schema.pages[pageIndex]?.sections?.[sectionIndex]?.questions?.push({
        label: questionLabel,
        type: questionType,
        required: isQuestionRequired,
        id: questionId ?? computedQuestionId,
        questionOptions: {
          rendering: fieldType,
          concept: selectedConcept.uuid,
          conceptMappings: conceptMappings,
          answers: selectedAnswers.map((answer) => ({
            concept: answer.id,
            label: answer.text,
          })),
        },
        validators: [],
      });

      onSchemaChange({ ...schema });

      resetIndices();
      setQuestionLabel("");
      setQuestionId("");
      setIsQuestionRequired(false);
      setQuestionType(null);
      setFieldType(null);
      setSelectedConcept(null);
      setConceptMappings([]);
      setAnswers([]);
      setSelectedAnswers([]);

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("questionCreated", "New question created"),
      });
    } catch (error) {
      showNotification({
        title: t("errorCreatingQuestion", "Error creating question"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  const updateQuestion = (questionIndex) => {
    try {
      const mappedAnswers = selectedAnswers?.map((answer) => ({
        concept: answer.id,
        label: answer.text,
      }));

      const data = {
        label: questionLabel ? questionLabel : questionToEdit.label,
        type: questionType ? questionType : questionToEdit.type,
        required: isQuestionRequired
          ? isQuestionRequired
          : /true/.test(questionToEdit?.required),
        id: questionId ? questionId : questionToEdit.id,
        questionOptions: {
          rendering: fieldType
            ? fieldType
            : questionToEdit.questionOptions.rendering,
          concept: selectedConcept?.uuid
            ? selectedConcept.uuid
            : questionToEdit.questionOptions.concept,
          conceptMappings: conceptMappings.length
            ? conceptMappings
            : questionToEdit.questionOptions.conceptMappings,
          answers: mappedAnswers.length
            ? mappedAnswers
            : questionToEdit.questionOptions.answers,
        },
      };

      schema.pages[pageIndex].sections[sectionIndex].questions[questionIndex] =
        data;

      onSchemaChange({ ...schema });

      resetIndices();
      setQuestionLabel("");
      setQuestionId("");
      setIsQuestionRequired(false);
      setQuestionType(null);
      setFieldType(null);
      setSelectedConcept(null);
      setConceptMappings([]);
      setAnswers([]);
      setSelectedAnswers([]);
      onQuestionEdit(null);

      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("questionUpdated", "Question updated"),
      });
    } catch (error) {
      showNotification({
        title: t("errorUpdatingQuestion", "Error updating question"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };

  return (
    <ComposedModal open={showModal} onClose={() => onModalChange(false)}>
      <ModalHeader title={t("createNewQuestion", "Create a new question")} />
      <Form onSubmit={(event) => event.preventDefault()}>
        <ModalBody hasScrollingContent>
          <FormGroup legendText={""}>
            <Stack gap={5}>
              <TextInput
                id="questionLabel"
                labelText={t("questionLabel", "Label")}
                placeholder={t("labelPlaceholder", "e.g. Type of Anaesthesia")}
                value={questionLabel}
                onChange={(event) => setQuestionLabel(event.target.value)}
                required
              />
              <RadioButtonGroup
                defaultSelected="optional"
                name="isQuestionRequired"
                legendText={t(
                  "isQuestionRequiredOrOptional",
                  "Is this question a required or optional field? Required fields must be answered before the form can be submitted."
                )}
              >
                <RadioButton
                  id="questionIsNotRequired"
                  defaultChecked={true}
                  labelText={t("optional", "Optional")}
                  onClick={() => setIsQuestionRequired(false)}
                  value="optional"
                />
                <RadioButton
                  id="questionIsRequired"
                  defaultChecked={false}
                  labelText={t("required", "Required")}
                  onClick={() => setIsQuestionRequired(true)}
                  value="required"
                />
              </RadioButtonGroup>
              <Select
                value={questionType}
                onChange={(event) => setQuestionType(event.target.value)}
                id="questionType"
                invalidText={t("typeRequired", "Type is required")}
                labelText={t("questionType", "Question type")}
                required
              >
                {!questionType && (
                  <SelectItem
                    text={t("chooseQuestionType", "Choose a question type")}
                    value=""
                  />
                )}
                {questionTypes.map((questionType, key) => (
                  <SelectItem
                    text={questionType}
                    value={questionType}
                    key={key}
                  />
                ))}
              </Select>
              <Select
                value={fieldType}
                onChange={(event) => setFieldType(event.target.value)}
                id="renderingType"
                invalidText={t(
                  "validFieldTypeRequired",
                  "A valid field type value is required"
                )}
                labelText={t("fieldType", "Field type")}
                required
              >
                {!fieldType && (
                  <SelectItem
                    text={t("chooseFieldType", "Choose a field type")}
                    value=""
                  />
                )}
                {fieldTypes.map((fieldType, key) => (
                  <SelectItem text={fieldType} value={fieldType} key={key} />
                ))}
              </Select>
              {fieldType === FieldTypes.Number ? (
                <>
                  <TextInput
                    id="min"
                    labelText="Min"
                    value={min || ""}
                    onChange={(event) => setMin(event.target.value)}
                    required
                  />
                  <TextInput
                    id="max"
                    labelText="Max"
                    value={max || ""}
                    onChange={(event) => setMax(event.target.value)}
                    required
                  />
                </>
              ) : fieldType === FieldTypes.TextArea ? (
                <TextInput
                  id="textAreaRows"
                  labelText={t("rows", "Rows")}
                  value={rows || ""}
                  onChange={(event) => setRows(event.target.value)}
                  required
                />
              ) : null}
              <TextInput
                id="questionId"
                invalid={questionIdExists(questionId)}
                invalidText={t(
                  "questionIdExists",
                  "This question ID already exists in your schema"
                )}
                labelText={t("questionId", "Question ID")}
                value={questionId}
                onChange={(event) => {
                  setQuestionId(event.target.value);
                }}
                placeholder={t(
                  "questionIdPlaceholder",
                  'Enter a unique ID e.g. "anaesthesiaType" for a question asking about the type of anaesthesia.'
                )}
                required
              />
              {fieldType !== FieldTypes.UiSelectExtended && (
                <div>
                  <FormLabel className={styles.label}>
                    {t("selectBackingConcept", "Select backing concept")}
                  </FormLabel>
                  <Layer>
                    <Search
                      size="md"
                      id="conceptLookup"
                      labelText={t("enterConceptName", "Enter concept name")}
                      placeholder={t("searchConcept", "Search concept")}
                      onClear={() => setSelectedConcept(null)}
                      onChange={handleConceptChange}
                      value={(() => {
                        if (conceptToLookup) {
                          return conceptToLookup;
                        }
                        if (selectedConcept) {
                          return selectedConcept.display;
                        }
                        return "";
                      })()}
                      required
                    />
                  </Layer>
                  {(() => {
                    if (!conceptToLookup) return null;
                    if (isLoadingConcepts)
                      return (
                        <InlineLoading
                          className={styles.loader}
                          description={t("searching", "Searching") + "..."}
                        />
                      );
                    if (concepts && concepts?.length && !isLoadingConcepts) {
                      return (
                        <ul className={styles.conceptList}>
                          {concepts?.map((concept, index) => (
                            <li
                              role="menuitem"
                              className={styles.concept}
                              key={index}
                              onClick={() => handleConceptSelect(concept)}
                            >
                              {concept.display}
                            </li>
                          ))}
                        </ul>
                      );
                    }
                    return (
                      <Layer>
                        <Tile className={styles.emptyResults}>
                          <span>
                            {t(
                              "noMatchingConcepts",
                              "No concepts were found that match"
                            )}{" "}
                            <strong>"{conceptToLookup}".</strong>
                          </span>
                        </Tile>
                      </Layer>
                    );
                  })()}
                </div>
              )}

              {/* Handle Concept Mappings */}
              {/* {conceptMappings && conceptMappings.length ? (
            <div>{JSON.stringify(conceptMappings)}</div>
          ) : null} */}

              {selectedAnswers.length ? (
                <div>
                  {selectedAnswers.map((answer) => (
                    <Tag className={styles.tag} key={answer.id} type={"blue"}>
                      {answer.text}
                    </Tag>
                  ))}
                </div>
              ) : null}

              {answers && answers.length ? (
                <MultiSelect
                  id="selectAnswers"
                  itemToString={(item) => item.text}
                  items={answers.map((answer) => ({
                    id: answer.concept,
                    text: answer.label,
                  }))}
                  onChange={({ selectedItems }) =>
                    setSelectedAnswers(selectedItems.sort())
                  }
                  size="md"
                  titleText={t(
                    "selectAnswersToDisplay",
                    "Select answers to display"
                  )}
                />
              ) : null}
            </Stack>
          </FormGroup>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button onClick={() => onModalChange(false)} kind="secondary">
          {t("cancel", "Cancel")}
        </Button>
        <Button
          disabled={
            !questionLabel ||
            !questionId ||
            questionIdExists(questionId) ||
            !fieldType ||
            (fieldType !== FieldTypes.UiSelectExtended && !selectedConcept)
          }
          onClick={handleCreateQuestion}
        >
          <span>{t("save", "Save")}</span>
        </Button>
      </ModalFooter>
    </ComposedModal>
  );
};

export default AddQuestionModal;
