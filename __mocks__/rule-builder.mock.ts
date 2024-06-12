import { type formRule } from '../src/components/rule-builder/rule-builder.component';
import { type Schema, type Question } from '../src/types';
interface UseFormMockValues {
  rules: Array<formRule>;
  setRules: () => jest.Mock;
}

export const useFormMockValues: UseFormMockValues = { rules: [], setRules: () => jest.fn()}
export const numberRenderingQuestion: Question = {
  'label': 'Age',
  'type': 'obs',
  'required': true,
  'id': 'age',
  'questionOptions': {
    'rendering': 'number',
    'concept': '162370AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'conceptMappings': [
      {
        'relationship': 'SAME-AS',
        'type': 'CIEL',
        'value': '162370'
      },
      {
        'relationship': 'SAME-AS',
        'type': 'SNOMED CT',
        'value': '419702001'
      }
    ]
  },
  'validators': []
}

export const dateRenderingQuestion: Question = {
  'label': 'date',
  'type': 'obs',
  'required': false,
  'id': 'date',
  'questionOptions': {
    'rendering': 'date',
    'concept': '162370AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
    'conceptMappings': [
      {
        'relationship': 'SAME-AS',
        'type': 'CIEL',
        'value': '162370'
      },
      {
        'relationship': 'SAME-AS',
        'type': 'SNOMED CT',
        'value': '419702001'
      }
    ],
    'answers': []
  },
  'validators': []
}

export const schema: Schema = {
  'name': 'form1',
  'pages': [
    {
      'label': 'page1',
      'sections': [
        {
          'label': 'section1',
          'isExpanded': 'true',
          'questions': [
            {
              'label': 'Name',
              'type': 'obs',
              'required': true,
              'id': 'name',
              'questionOptions': {
                'rendering': 'text',
                'concept': '162370AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                'conceptMappings': [
                  {
                    'relationship': 'SAME-AS',
                    'type': 'CIEL',
                    'value': '162370'
                  },
                  {
                    'relationship': 'SAME-AS',
                    'type': 'SNOMED CT',
                    'value': '419702001'
                  }
                ]
              },
              'validators': []
            },
            {
              'label': 'Are you currently in HIV care or under ART?',
              'id': 'currentlyOnArt',
              'type': 'obs',
              'questionOptions': {
                'rendering': 'select',
                'concept': 'a8afba58-1350-11df-a1f1-0026b9348838',
                'answers': [
                  {
                    'concept': 'a899b35c-1350-11df-a1f1-0026b9348838',
                    'label': 'Yes'
                  },
                  {
                    'concept': 'a899b42e-1350-11df-a1f1-0026b9348838',
                    'label': 'No'
                  }
                ]
              },
              'validators': []
            }
          ]
        }
      ]
    },
    {
      'label': 'page2',
      'sections': [
        {
          'label': 'section2',
          'isExpanded': 'true',
          'questions': [
            {
              'label': 'Age',
              'type': 'obs',
              'required': true,
              'id': 'age',
              'questionOptions': {
                'rendering': 'text',
                'concept': '162370AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA',
                'conceptMappings': [
                  {
                    'relationship': 'SAME-AS',
                    'type': 'CIEL',
                    'value': '162370'
                  },
                  {
                    'relationship': 'SAME-AS',
                    'type': 'SNOMED CT',
                    'value': '419702001'
                  }
                ]
              },
              'validators': []
            }
          ]
        }
      ]
    }
  ],
  'processor': 'EncounterFormProcessor',
  'encounterType': '',
  'referencedForms': [],
  'uuid': '',
  'description': 'desc1'
}
