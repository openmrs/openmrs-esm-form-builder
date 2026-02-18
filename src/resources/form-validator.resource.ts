import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { FormField } from '@openmrs/esm-form-engine-lib';
import type { Schema } from '@types';
import type { ConfigObject } from '../config-schema';

interface ConceptMapping {
  type: string;
  value: string;
}

interface Field {
  label?: string;
  concept?: string;
  id?: string;
  type?: string;
}

interface ErrorMessageResponse {
  errorMessage?: string;
  field: Field;
}

interface WarningMessageResponse {
  field: Field;
  warningMessage?: string;
}

export const handleFormValidation = async (
  schema: string | Schema,
  configObject: ConfigObject['dataTypeToRenderingMap'],
): Promise<[Array<ErrorMessageResponse>, Array<WarningMessageResponse>]> => {
  const errors: Array<ErrorMessageResponse> = [];
  const warnings: Array<WarningMessageResponse> = [];

  if (schema) {
    const parsedForm: Schema = typeof schema === 'string' ? JSON.parse(schema) : schema;

    const asyncTasks: Array<Promise<void>> = [];

    parsedForm.pages?.forEach((page) =>
      page.sections?.forEach((section: { questions: Array<FormField> }) =>
        section.questions?.forEach((question) => {
          asyncTasks.push(
            handleQuestionValidation(question, errors, configObject, warnings),
            handleAnswerValidation(question, errors),
            handlePatientIdentifierValidation(question, errors),
          );
          if (question.type === 'obsGroup') {
            question?.questions?.forEach((obsGrpQuestion) =>
              asyncTasks.push(
                handleQuestionValidation(obsGrpQuestion, errors, configObject, warnings),
                handleAnswerValidation(obsGrpQuestion, errors),
              ),
            );
          }
        }),
      ),
    );

    await Promise.all(asyncTasks);
  }

  return [errors, warnings]; // Return empty arrays if schema is falsy
};

const handleQuestionValidation = async (
  conceptObject: FormField,
  errorsArray: Array<ErrorMessageResponse>,
  configObject: ConfigObject['dataTypeToRenderingMap'],
  warningsArray: Array<WarningMessageResponse>,
) => {
  const conceptRepresentation =
    'custom:(uuid,display,datatype,answers,conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))';

  const conceptMappings = (conceptObject.questionOptions as { conceptMappings?: Array<ConceptMapping> })
    .conceptMappings;
  const searchRef = conceptObject.questionOptions.concept
    ? conceptObject.questionOptions.concept
    : conceptMappings?.length
      ? conceptMappings
          .map((mapping: ConceptMapping) => {
            return `${mapping.type}:${mapping.value}`;
          })
          .join(',')
      : '';

  if (searchRef) {
    try {
      const { data } = await openmrsFetch(`${restBaseUrl}/concept?references=${searchRef}&v=${conceptRepresentation}`);
      if (data.results.length) {
        const [resObject] = data.results;
        if (resObject.datatype.name === 'Boolean') {
          conceptObject.questionOptions.answers?.forEach((answer) => {
            if (
              answer.concept !== 'cf82933b-3f3f-45e7-a5ab-5d31aaee3da3' &&
              answer.concept !== '488b58ff-64f5-4f8a-8979-fa79940b1594'
            ) {
              errorsArray.push({
                errorMessage: `❌ concept "${conceptObject.questionOptions.concept}" of type "boolean" has a non-boolean answer "${answer.label}"`,
                field: conceptObject,
              });
            }
          });
        }

        if (resObject.datatype.name === 'Coded') {
          conceptObject.questionOptions.answers?.forEach((answer) => {
            if (!resObject.answers.some((answerObject: { uuid: string }) => answerObject.uuid === answer.concept)) {
              warningsArray.push({
                warningMessage: `⚠️ answer: "${answer.label}" - "${answer.concept}" does not exist in the response answers but exists in the form`,
                field: conceptObject,
              });
            }
          });
        }

        dataTypeChecker(conceptObject, resObject, errorsArray, configObject);
      } else {
        errorsArray.push({
          errorMessage: `❓ Concept "${conceptObject.questionOptions.concept}" not found`,
          field: conceptObject,
        });
      }
    } catch (error) {
      console.error(error);
    }
  } else if (conceptObject.questionOptions.rendering !== 'workspace-launcher') {
    errorsArray.push({
      errorMessage: `❓ No UUID`,
      field: conceptObject,
    });
  }
};

const handlePatientIdentifierValidation = async (question: FormField, errors: Array<ErrorMessageResponse>) => {
  if (question.type === 'patientIdentifier' && !question.questionOptions.identifierType) {
    errors.push({
      errorMessage: `❓ Patient identifier type missing in schema`,
      field: question,
    });
  }
  const patientIdentifier = question.questionOptions.identifierType;

  if (patientIdentifier) {
    try {
      const { data } = await openmrsFetch(
        `${restBaseUrl}/patientidentifiertype/${question.questionOptions.identifierType}`,
      );
      if (!data) {
        errors.push({
          errorMessage: `❓ The identifier type does not exist`,
          field: question,
        });
      }
    } catch (error) {
      console.error('Error fetching patient identifier:', error);
      errors.push({
        errorMessage: `❓ The identifier type does not exist`,
        field: question,
      });
    }
  }
};

const dataTypeChecker = (
  conceptObject: FormField,
  responseObject: { datatype: { name: string }; answers: Array<{ uuid: string }> },
  array: Array<ErrorMessageResponse>,
  dataTypeToRenderingMap: ConfigObject['dataTypeToRenderingMap'],
) => {
  if (Object.prototype.hasOwnProperty.call(dataTypeToRenderingMap, responseObject.datatype.name)) {
    if (!dataTypeToRenderingMap[responseObject.datatype.name].includes(conceptObject.questionOptions.rendering)) {
      array.push({
        errorMessage: `❓ ${conceptObject.questionOptions.concept}: datatype "${responseObject.datatype.name}" doesn't match control type "${conceptObject.questionOptions.rendering}"`,
        field: conceptObject,
      });
    }
  } else {
    array.push({
      errorMessage: `❓ Untracked datatype "${responseObject.datatype.name}"`,
      field: conceptObject,
    });
  }
};

const handleAnswerValidation = async (questionObject: FormField, array: Array<ErrorMessageResponse>) => {
  const answerArray = questionObject.questionOptions.answers;
  const conceptRepresentation =
    'custom:(uuid,display,datatype,conceptMappings:(conceptReferenceTerm:(conceptSource:(name),code)))';

  if (answerArray?.length) {
    for (const answer of answerArray) {
      const searchRef = answer.concept
        ? answer.concept
        : answer.conceptMappings?.length
          ? answer.conceptMappings
              .map((eachMapping: ConceptMapping) => {
                return `${eachMapping.type}:${eachMapping.value}`;
              })
              .join(',')
          : '';

      try {
        const response = await openmrsFetch(
          `${restBaseUrl}/concept?references=${searchRef}&v=${conceptRepresentation}`,
        );
        if (!response.data.results.length) {
          array.push({
            errorMessage: `❌ concept "${answer.concept}" not found`,
            field: answer,
          });
        }
      } catch (error) {
        console.error('Error fetching concept:', error);
      }
    }
  }
};
