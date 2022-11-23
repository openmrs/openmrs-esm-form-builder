import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  ComboBox,
  ComposedModal,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  TextInput,
} from "@carbon/react";
import { Answer, Concept, ConceptMapping, Question } from "../../../types";
import { Add } from "@carbon/react/icons";
import { SchemaContext } from "../../../context/context";
import { showToast, useConfig } from "@openmrs/esm-framework";
import { useConceptLookup } from "../../../hooks/useConceptLookup";
import styles from "./modals.scss";

interface CreateQuestionModalProps {
  questions: any;
}

const CreateQuestion: React.FC<CreateQuestionModalProps> = ({ questions }) => {
  const { t } = useTranslation();
  const [searchConcept, setSearchConcept] = useState("");
  const { concepts } = useConceptLookup(searchConcept);
  const { schema, setSchema } = useContext(SchemaContext);
  const { questionTypes } = useConfig();
  const { renderElements } = useConfig();
  const [openCreateQuestionModal, setOpenCreateQuestionModal] = useState(false);
  const [questionLabel, setQuestionLabel] = useState("");
  const [questionType, setQuestionType] = useState("");
  const [questionId, setQuestionId] = useState("");
  // Question Options
  const [renderElement, setRenderElement] = useState("");
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [max, setMax] = useState("");
  const [min, setMin] = useState("");
  const [concept, setConcept] = useState<string>(null);
  const [conceptMappings, setConceptMappings] = useState<ConceptMapping[]>([]);
  const [weekList, setWeekList] = useState<any>([]);
  const [attributeType, setAttributeType] = useState("");
  const [rows, setRows] = useState("");
  const [orderSettingUuid, setOrderSettingUuid] = useState("");
  const [orderType, setOrderType] = useState("");
  const [selectableOrders, setSelectableOrders] = useState<Answer[]>([]);

  useEffect(() => {
    setQuestionLabel("");
    setQuestionType("placeholder-item");
    setQuestionId("");
    // Question Options
    setRenderElement("placeholder-item");
  }, [openCreateQuestionModal]);

  const onConceptChange = useCallback((selectedConcept: Concept) => {
    setAnswers(
      selectedConcept.answers.map((answer) => {
        return { label: answer.display, concept: answer.uuid };
      })
    );
    setConcept(selectedConcept.uuid);
    setConceptMappings(
      selectedConcept.mappings.map((map) => {
        let data = map.display.split(": ");
        return { type: data[0], value: data[1] };
      })
    );
  }, []);

  const handleSubmit = (event) => {
    event.preventDefault();
    let newQuestion = {
      label: questionLabel,
      type: questionType,
      id: questionId,
      questionOptions: {},
    };
    try {
      switch (renderElement) {
        case "select" || "multiCheckbox" || "radio":
          newQuestion.questionOptions = {
            concept: concept,
            rendering: renderElement,
            answers: answers,
          };
          break;
        case "number":
          newQuestion.questionOptions = {
            concept: concept,
            rendering: renderElement,
            max: max,
            min: min,
          };
          break;
        case "date":
          newQuestion.questionOptions = {
            concept: concept,
            rendering: renderElement,
            weeksList: weekList,
          };
          break;
        case "textarea":
          newQuestion.questionOptions = {
            concept: concept,
            rendering: renderElement,
            rows: rows,
          };
          break;
        case "ui-select-extended":
          newQuestion.questionOptions = {
            rendering: renderElement,
            attributeType: attributeType,
          };
          break;
        case "repeating":
          newQuestion.questionOptions = {
            rendering: renderElement,
            orderSettingUuid: orderSettingUuid,
            orderType: orderType,
            selectableOrders: selectableOrders,
          };
          break;
        default:
          newQuestion.questionOptions = {
            rendering: renderElement,
            concept: concept,
          };
          break;
      }
      questions.push(newQuestion);
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("createQuestionSuccess", "Question Created"),
      });
      setOpenCreateQuestionModal(false);
    } catch (error) {
      showToast({
        title: t("error", "Error"),
        kind: "error",
        critical: true,
        description: error?.message,
      });
    }
  };
  return (
    <>
      <div>
        <ComposedModal
          open={openCreateQuestionModal}
          onClose={() => setOpenCreateQuestionModal(false)}
        >
          <ModalHeader title={t("createQuestion", "Create Question")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody
              hasScrollingContent
              aria-label="new-question"
              className={styles.modalContent}
            >
              <FormGroup legendText={""}>
                <TextInput
                  id="questionLabel"
                  labelText="Label"
                  value={questionLabel}
                  onChange={(event) => setQuestionLabel(event.target.value)}
                  required
                />
                <Select
                  value={questionType}
                  onChange={(event) => setQuestionType(event.target.value)}
                  id="type"
                  invalidText="A valid value is required"
                  labelText="Type"
                  disabled={false}
                  inline={false}
                  invalid={false}
                  required
                >
                  <SelectItem
                    text="Choose an option"
                    value="placeholder-item"
                    disabled
                    hidden
                  />
                  {questionTypes.map((type, key) => (
                    <SelectItem text={type} value={type} key={key} />
                  ))}
                </Select>
                <Select
                  value={renderElement}
                  onChange={(event) => setRenderElement(event.target.value)}
                  id="rendering"
                  invalidText="A valid value is required"
                  labelText="Rendering"
                  disabled={false}
                  inline={false}
                  invalid={false}
                  required
                >
                  <SelectItem
                    text="Choose an option"
                    value="placeholder-item"
                    disabled
                    hidden
                  />
                  {renderElements.map((element, key) => (
                    <SelectItem text={element} value={element} key={key} />
                  ))}
                </Select>
                {renderElement === "number" ? (
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
                ) : renderElement === "textarea" ? (
                  <TextInput
                    id="rows"
                    labelText="Rows"
                    value={rows || ""}
                    onChange={(event) => setRows(event.target.value)}
                    required
                  />
                ) : null}
                <TextInput
                  id="questionId"
                  labelText="ID"
                  value={questionId}
                  onChange={(event) => setQuestionId(event.target.value)}
                  required
                />
                {renderElement !== "ui-select-extended" ? (
                  <ComboBox
                    onChange={(event) => {
                      event.selectedItem != null
                        ? onConceptChange(event.selectedItem)
                        : null;
                    }}
                    id="concepts"
                    onInputChange={(event) => {
                      setSearchConcept(event);
                    }}
                    items={concepts}
                    itemToString={(concept) =>
                      concept ? concept?.display : ""
                    }
                    placeholder="Search Concept"
                    titleText="Concept"
                    className={styles.comboBox}
                    required
                  />
                ) : null}
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type={"submit"} kind={"primary"}>
                {t("save", "Save")}
              </Button>
              <Button
                kind={"secondary"}
                onClick={() => setOpenCreateQuestionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        renderIcon={Add}
        kind="tertiary"
        size="small"
        hasIconOnly
        iconDescription="New Question"
        onClick={() => {
          setOpenCreateQuestionModal(true);
        }}
      />
    </>
  );
};

export default CreateQuestion;
