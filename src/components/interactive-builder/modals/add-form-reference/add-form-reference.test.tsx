import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import AddFormReferenceModal from './add-form-reference.modal';
import { Form, type Schema } from '@types';
import { renderWithSwr, waitForLoadingToFinish } from '@tools/test-helpers';
import { type FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import userEvent from '@testing-library/user-event';

type OpenmrsFetchResponse = Promise<
  FetchResponse<{
    results: Array<unknown>;
  }>
>;

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedCloseModal = jest.fn();
const mockedOnSchemaChange = jest.fn();

const formsResponse = [
  {
    uuid: '107c32e8-a318-30bf-acfc-a0244f3a795a',
    name: 'Adult HIV Return Visit Form',
    encounterType: { uuid: '0e8230ce-bd1d-43f5-a863-cf44344fa4b0', name: 'Adult Visit' },
    version: '1',
    published: true,
    retired: false,
    resources: [
      {
        uuid: 'a9859ac1-1767-4bd4-a343-4203c234ec78',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: '649e206a-c885-4c81-9ae2-23e0c45be098',
      },
    ],
  },
  {
    uuid: '9e1a0c68-ca19-3482-9ffb-0a6b4e591c2a',
    name: 'Covid 19',
    encounterType: { uuid: 'dd528487-82a5-4082-9c72-ed246bd49591', name: 'Consultation' },
    version: '1',
    published: true,
    retired: false,
    resources: [
      {
        uuid: 'e5c40e19-316b-4e70-a9c8-17b56c243a7b',
        name: 'JSON schema',
        dataType: 'AmpathJsonSchema',
        valueReference: 'ac70f4bf-1e6b-4ce7-9f0b-4a5260a41e2d',
      },
    ],
  },
];
const clobdataResponse = {
  name: 'Adult HIV Return Visit Form',
  uuid: 'xxxx',
  description: 'Ampath POC adult return visit form',
  version: '1',
  published: true,
  retired: false,
  encounter: 'Adult Visit',
  processor: 'EncounterFormProcessor',
  pages: [
    {
      label: 'Encounter Details',
      sections: [
        {
          label: 'Encounter Details',
          isExpanded: 'true',
          questions: [
            {
              label: 'Visit date:',
              id: 'encDate',
            },
            {
              label: 'Provider:',
              id: 'provider',
            },
          ],
        },
        {
          label: 'Patient Details',
          isExpanded: 'true',
          questions: [
            {
              label: 'Patient name:',
              id: 'patientName',
            },
          ],
        },
      ],
    },
    {
      label: 'Pre-Clinic Review',
      sections: [
        {
          label: 'Pre-clinic Review',
          questions: [
            {
              label: 'Was this visit scheduled?',
              id: 'scheduledVisit',
            },
            {
              label: 'Facility name (site/satellite clinic required):',
              id: 'location',
            },
          ],
        },
      ],
    },
  ],
};

const schema: Schema = {
  encounterType: '',
  name: 'Sample Form',
  processor: 'EncounterFormProcessor',
  referencedForms: [],
  uuid: '',
  version: '1.0',
  pages: [
    {
      label: 'Test Page',
      sections: [],
    },
  ],
};
describe('AddFormReferenceModal', () => {
  beforeEach(() => {
    mockedOpenmrsFetch.mockImplementation((url: string): OpenmrsFetchResponse => {
      if (url.includes('/form')) {
        return Promise.resolve({
          data: { results: formsResponse },
        } as unknown as FetchResponse<{ results: Array<unknown> }>);
      }

      if (url.includes('/clobdata/')) {
        return Promise.resolve({
          data: clobdataResponse,
        } as unknown as FetchResponse<{ results: Array<unknown> }>);
      }

      return Promise.reject(new Error(`Unhandled fetch URL: ${url}`));
    });
  });

  it('renders an empty state view if no forms are available', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } } as unknown as OpenmrsFetchResponse);

    renderAddFormReferenceModal();

    expect(screen.getByText(/loading.../i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
    });

    expect(screen.getByText(/No forms available/i)).toBeInTheDocument();
  });
});

it('renders a dropdown with the list of forms', async () => {
  const user = userEvent.setup();

  renderAddFormReferenceModal();

  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });

  const dropdown = screen.getByRole('combobox', { name: /select form/i });
  expect(dropdown).toBeInTheDocument();

  user.click(dropdown);
  expect(await screen.findByText(/Adult HIV Return Visit Form/i)).toBeInTheDocument();
  expect(await screen.findByText(/Covid 19/i)).toBeInTheDocument();
});

it('renders a dropdown with the list of pages', async () => {
  const user = userEvent.setup();
  renderAddFormReferenceModal();
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /select form/i }));
  await user.click(await screen.findByText(/Adult HIV Return Visit Form/i));
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });

  const pageDropdown = screen.getByRole('combobox', { name: /Adult HIV Return Visit Form Pages:/i });
  expect(pageDropdown).toBeInTheDocument();

  user.click(pageDropdown);
  expect(await screen.findByText(/Encounter Details/i)).toBeInTheDocument();
  expect(await screen.findByText(/Pre-Clinic Review/i)).toBeInTheDocument();
});

it('renders a dropdown with the list of sections', async () => {
  const user = userEvent.setup();
  renderAddFormReferenceModal();
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /select form/i }));
  await user.click(await screen.findByText(/Adult HIV Return Visit Form/i));
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /Adult HIV Return Visit Form Pages:/i }));
  await user.click(await screen.findByText(/Encounter Details/i));

  const sectionRadioGroup = screen.getByRole('group', { name: /Encounter Details Sections:/i });
  expect(sectionRadioGroup).toBeInTheDocument();

  expect(await screen.findByLabelText(/Encounter Details/i)).toBeInTheDocument();
  expect(await screen.findByLabelText(/Patient Details/i)).toBeInTheDocument();
});

it('renders a checkbox for each question in the selected section', async () => {
  const user = userEvent.setup();
  renderAddFormReferenceModal();
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /select form/i }));
  await user.click(await screen.findByText(/Adult HIV Return Visit Form/i));
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /Adult HIV Return Visit Form Pages:/i }));
  await user.click(await screen.findByText(/Encounter Details/i));
  await user.click(screen.getByLabelText(/Encounter Details/i));

  const questionCheckboxGroup = screen.getByRole('group', { name: /Select questions/i });
  expect(questionCheckboxGroup).toBeInTheDocument();

  const visitDateCheckbox = await screen.findByLabelText(/Visit date:/i);
  expect(visitDateCheckbox).toBeInTheDocument();
  expect(visitDateCheckbox).toBeChecked();

  const providerCheckbox = await screen.findByLabelText(/Provider:/i);
  expect(providerCheckbox).toBeInTheDocument();
  expect(providerCheckbox).toBeChecked();
});

it('renders a disabled add when no form/page/section or all questions are unchecked', async () => {
  const user = userEvent.setup();
  renderAddFormReferenceModal();

  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });

  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeDisabled();

  await user.click(screen.getByRole('combobox', { name: /select form/i }));
  await user.click(await screen.findByText(/Adult HIV Return Visit Form/i));

  expect(addButton).toBeDisabled();

  await user.click(screen.getByRole('combobox', { name: /Adult HIV Return Visit Form Pages:/i }));
  await user.click(await screen.findByText(/Encounter Details/i));

  expect(addButton).toBeDisabled();

  await user.click(screen.getByLabelText(/Encounter Details/i));

  expect(addButton).toBeEnabled();

  const visitDateCheckbox = await screen.findByLabelText(/Visit date:/i);
  const providerCheckbox = await screen.findByLabelText(/Provider:/i);

  await user.click(visitDateCheckbox);
  await user.click(providerCheckbox);
  expect(addButton).toBeDisabled();

  await user.click(visitDateCheckbox);
  expect(addButton).toBeEnabled();
});

it('calls onSchemaChange when add button is clicked', async () => {
  const user = userEvent.setup();
  renderAddFormReferenceModal();

  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });

  await user.click(screen.getByRole('combobox', { name: /select form/i }));
  await user.click(await screen.findByText(/Adult HIV Return Visit Form/i));
  await waitFor(() => {
    expect(screen.queryByText(/loading.../i)).not.toBeInTheDocument();
  });
  await user.click(screen.getByRole('combobox', { name: /Adult HIV Return Visit Form Pages:/i }));
  await user.click(await screen.findByText(/Encounter Details/i));
  await user.click(screen.getByLabelText(/Patient Details/i));

  await waitFor(() => {
    expect(screen.getByRole('group', { name: /Select questions/i })).toBeInTheDocument();
  });
  const addButton = screen.getByRole('button', { name: /add/i });
  expect(addButton).toBeEnabled();

  await user.click(addButton);

  expect(mockedOnSchemaChange).toHaveBeenCalledWith({
    encounterType: '',
    name: 'Sample Form',
    processor: 'EncounterFormProcessor',
    referencedForms: [{ formName: 'Adult HIV Return Visit Form', alias: 'Adult HIV Return Visit Form' }],
    uuid: '',
    version: '1.0',
    pages: [
      {
        label: 'Test Page',
        sections: [
          {
            label: 'Patient Details',
            isExpanded: 'true',
            questions: [],
            reference: {
              form: 'Adult HIV Return Visit Form',
              page: 'Encounter Details',
              section: 'Patient Details',
              excludeQuestions: [],
            },
          },
        ],
      },
    ],
  });
  expect(mockedCloseModal).toHaveBeenCalled();
});
const renderAddFormReferenceModal = () => {
  renderWithSwr(
    <AddFormReferenceModal
      closeModal={mockedCloseModal}
      onSchemaChange={mockedOnSchemaChange}
      pageIndex={0}
      schema={schema}
    />,
  );
};
