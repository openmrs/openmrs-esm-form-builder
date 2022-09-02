import React, { useContext, useEffect, useState } from "react";
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
  Row,
  Select,
  SelectItem,
  TextInput,
} from "carbon-components-react";
import { Answer, Concept, ConceptMapping, Question } from "../../../api/types";
import { Edit, TrashCan } from "@carbon/icons-react/next";
import { SchemaContext } from "../../../context/context";
import { showToast } from "@openmrs/esm-framework";
import { useConcepts } from "../../../api/concept";
import styles from "./modals.scss";

interface EditQuestionModalProps {
  question: Question;
}

const EditQuestion: React.FC<EditQuestionModalProps> = ({ question }) => {
  const { t } = useTranslation();
  const { concepts } = useConcepts();
  const { schema, setSchema } = useContext(SchemaContext);
  const [openEditQuestionModal, setOpenEditQuestionModal] = useState(false);
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

  const types = [
    {
      key: "obs",
      value: "obs",
    },
    {
      key: "obsGroup",
      value: "obsGroup",
    },
    {
      key: "testOrder",
      value: "testOrder",
    },
    {
      key: "control",
      value: "control",
    },
    {
      key: "complex-obs",
      value: "complex-obs",
    },
    {
      key: "encounterDatetime",
      value: "encounterDatetime",
    },
    {
      key: "encounterProvider",
      value: "encounterProvider",
    },
    {
      key: "encounterLocation",
      value: "encounterLocation",
    },
    {
      key: "personAttribute",
      value: "personAttribute",
    },
  ];

  const renderElements = [
    {
      key: "text",
      value: "text",
    },
    {
      key: "number",
      value: "number",
    },
    {
      key: "select",
      value: "select",
    },
    {
      key: "date",
      value: "date",
    },
    {
      key: "multiCheckbox",
      value: "multiCheckbox",
    },
    {
      key: "textarea",
      value: "textarea",
    },
    {
      key: "radio",
      value: "radio",
    },
    {
      key: "ui-select-extended",
      value: "ui-select-extended",
    },
    {
      key: "group",
      value: "group",
    },
    {
      key: "repeating",
      value: "repeating",
    },
    {
      key: "drug",
      value: "drug",
    },
    {
      key: "file",
      value: "file",
    },
    {
      key: "field-set",
      value: "field-set",
    },
    {
      key: "problem",
      value: "problem",
    },
  ];

  useEffect(() => {
    setQuestionLabel(question.label);
    setQuestionType(question.type);
    setQuestionId(question.id);
    // Question Options
    setRenderElement(question.questionOptions.rendering);
    setConceptMappings(question.questionOptions.conceptMappings);
    switch (question.questionOptions.rendering) {
      case "select" || "multiCheckbox" || "radio":
        setConcept(question.questionOptions.concept);
        setAnswers(question.questionOptions.answers);
        break;
      case "number":
        setConcept(question.questionOptions.concept);
        setMax(question.questionOptions.max);
        setMin(question.questionOptions.min);
        break;
      case "date":
        setConcept(question.questionOptions.concept);
        setWeekList(question.questionOptions.weekList);
        break;
      case "textarea":
        setConcept(question.questionOptions.concept);
        setRows(question.questionOptions.rows);
        break;
      case "ui-select-extended":
        setAttributeType(question.questionOptions.attributeType);
        break;
      case "repeating":
        setOrderSettingUuid(question.questionOptions.orderSettingUuid);
        setOrderType(question.questionOptions.orderType);
        setSelectableOrders(question.questionOptions.selectableOrders);
        break;
      default:
        setConcept(question.questionOptions.concept);
        break;
    }
  }, [question]);

  const removeConcept = () => {
    setConcept(null);
    setAnswers([]);
    setConceptMappings([]);
    delete question.questionOptions.concept;
    delete question.questionOptions.conceptMappings;
    delete question.questionOptions.answers;
  };

  const onConceptChange = (concept: Concept) => {
    question.questionOptions.answers = concept.answers.map((answer) => {
      return { label: answer.display, concept: answer.uuid };
    });
    question.questionOptions.concept = concept.uuid;
    question.questionOptions.conceptMappings = concept.mappings.map((map) => {
      let data = map.display.split(": ");
      return { type: data[0], value: data[1] };
    });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    try {
      if (questionLabel != question.label) {
        question.label = questionLabel;
      }
      if (questionType != question.type) {
        question.type = questionType;
      }
      if (questionId != question.id) {
        question.id = questionId;
      }
      if (renderElement != question.questionOptions.rendering) {
        question.questionOptions.rendering = renderElement;
        switch (question.questionOptions.rendering) {
          case "select" || "multiCheckbox" || "radio":
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.rows;
            delete question.questionOptions.weekList;
            delete question.questionOptions.calculate;
            break;
          case "number":
            question.questionOptions.min = min;
            question.questionOptions.max = max;
            delete question.questionOptions.answers;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.rows;
            delete question.questionOptions.weekList;
            delete question.questionOptions.calculate;
            break;
          case "date":
            question.questionOptions.weekList = weekList;

            delete question.questionOptions.answers;
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.rows;
            delete question.questionOptions.calculate;
            break;
          case "textarea":
            question.questionOptions.rows = rows;

            delete question.questionOptions.answers;
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.weekList;
            delete question.questionOptions.calculate;
            break;
          case "ui-select-extended":
            question.questionOptions.attributeType = attributeType;

            delete question.questionOptions.concept;
            delete question.questionOptions.answers;
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.weekList;
            delete question.questionOptions.rows;
            delete question.questionOptions.calculate;
            break;
          case "repeating":
            question.questionOptions.orderSettingUuid = orderSettingUuid;
            question.questionOptions.orderType = orderType;
            question.questionOptions.selectableOrders = selectableOrders;

            delete question.questionOptions.concept;
            delete question.questionOptions.answers;
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.weekList;
            delete question.questionOptions.rows;
            delete question.questionOptions.calculate;
            break;
          default:
            delete question.questionOptions.answers;
            delete question.questionOptions.max;
            delete question.questionOptions.min;
            delete question.questionOptions.attributeType;
            delete question.questionOptions.orderSettingUuid;
            delete question.questionOptions.orderType;
            delete question.questionOptions.selectableOrders;
            delete question.questionOptions.rows;
            delete question.questionOptions.weekList;
            delete question.questionOptions.calculate;
            break;
        }
      }
      setSchema({ ...schema });
      showToast({
        title: t("success", "Success!"),
        kind: "success",
        critical: true,
        description: t("updateQuestion", "Question Updated"),
      });
      setOpenEditQuestionModal(false);
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
          open={openEditQuestionModal}
          onClose={() => setOpenEditQuestionModal(false)}
        >
          <ModalHeader title={t("editQuestion", "Edit Question")} />
          <Form onSubmit={handleSubmit}>
            <ModalBody>
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
                >
                  {types.map((type) => (
                    <SelectItem
                      text={type.value}
                      value={type.value}
                      key={type.key}
                    />
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
                >
                  {renderElements.map((element) => (
                    <SelectItem
                      text={element.value}
                      value={element.value}
                      key={element.key}
                    />
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
                  concept === null ? (
                    <ComboBox
                      onChange={(event) => {
                        event.selectedItem != null
                          ? onConceptChange(event.selectedItem)
                          : null;
                      }}
                      id="concepts"
                      items={concepts}
                      itemToString={(concept) =>
                        concept ? concept?.display : ""
                      }
                      placeholder="Search Concept"
                      titleText="Concept"
                      className={styles.comboBox}
                      required
                    />
                  ) : (
                    <Row className={styles.conceptRow}>
                      <TextInput
                        id="defaultConcept"
                        labelText="Concept"
                        defaultValue={question.questionOptions.concept}
                        readOnly
                      />
                      <Button
                        className={styles.removeConceptButton}
                        renderIcon={TrashCan}
                        iconDescription="Remove Concept"
                        size="small"
                        hasIconOnly
                        kind="ghost"
                        onClick={() => {
                          removeConcept();
                        }}
                      />
                    </Row>
                  )
                ) : null}
              </FormGroup>
            </ModalBody>
            <ModalFooter>
              <Button type={"submit"} kind={"primary"}>
                {t("save", "Save")}
              </Button>
              <Button
                kind={"secondary"}
                onClick={() => setOpenEditQuestionModal(false)}
              >
                {t("close", "Close")}
              </Button>
            </ModalFooter>
          </Form>
        </ComposedModal>
      </div>
      <Button
        size="sm"
        renderIcon={Edit}
        iconDescription="Edit Question"
        hasIconOnly
        kind="ghost"
        onClick={() => {
          setOpenEditQuestionModal(true);
        }}
      />
    </>
  );
};

export default EditQuestion;
