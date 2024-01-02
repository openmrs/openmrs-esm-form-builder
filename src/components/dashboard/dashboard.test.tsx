import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type FetchResponse, navigate, openmrsFetch, usePagination } from '@openmrs/esm-framework';
import { renderWithSwr, waitForLoadingToFinish } from '../../test-helpers';
import { deleteForm } from '../../forms.resource';
import Dashboard from './dashboard.component';

type OpenmrsFetchResponse = Promise<
  FetchResponse<{
    results: unknown[];
  }>
>;

type PaginationData = {
  currentPage: number;
  goTo: (page: number) => void;
  results: unknown[];
  totalPages: number;
  paginated: boolean;
  showNextButton: boolean;
  showPreviousButton: boolean;
  goToNext: () => void;
  goToPrevious: () => void;
};

const mockedOpenmrsFetch = jest.mocked(openmrsFetch);
const mockedDeleteForm = jest.mocked(deleteForm);
const mockUsePagination = jest.mocked(usePagination);

const formsResponse = [
  {
    uuid: '2ddde996-b1c3-37f1-a53e-378dd1a4f6b5',
    name: 'Test Form 1',
    encounterType: {
      uuid: 'dd528487-82a5-4082-9c72-ed246bd49591',
      name: 'Consultation',
    },
    version: '1',
    published: true,
    retired: false,
    resources: [
      {
        dataType: 'AmpathJsonSchema',
        name: 'JSON schema',
        uuid: '26e45c1a-a46d-4f69-af0a-c29baaed5b3e',
        valueReference: '9c35c3d7-1366-45ef-b4d7-ae635b22b6a7',
      },
    ],
  },
];

jest.mock('../../forms.resource', () => ({
  deleteForm: jest.fn(),
}));

jest.mock('@openmrs/esm-framework', () => {
  const originalModule = jest.requireActual('@openmrs/esm-framework');

  return {
    ...originalModule,
    usePagination: jest.fn().mockImplementation(() => ({
      currentPage: 1,
      goTo: () => {},
      results: [],
      paginated: true,
    })),
  };
});

global.window.URL.createObjectURL = jest.fn();

describe('Dashboard', () => {
  it('renders an empty state view if no forms are available', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/form builder/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /forms/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(screen.getByText(/there are no forms to display/i)).toBeInTheDocument();
    expect(screen.getByText(/create a new form/i)).toBeInTheDocument();
  });

  it('searches for a form by name and filters the list of forms', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const searchbox = screen.getByRole('searchbox') as HTMLInputElement;

    await user.type(searchbox, 'COVID');

    expect(searchbox.value).toBe('COVID');

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse.filter((form) => form.name === searchbox.value),
        }) as unknown as PaginationData,
    );

    await expect(screen.queryByText(/Test Form 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no matching forms to display/i)).toBeInTheDocument();
  });

  it('filters the list of forms by "published" status', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    renderDashboard();

    await waitForLoadingToFinish();

    const publishStatusFilter = screen.getByRole('combobox', {
      name: /filter by/i,
    });

    await user.click(publishStatusFilter);
    await user.click(screen.getByRole('option', { name: /unpublished/i }));

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse.filter((form) => !form.published),
        }) as unknown as PaginationData,
    );

    expect(screen.queryByText(/Test Form 1/i)).not.toBeInTheDocument();
    expect(screen.getByText(/no matching forms to display/i)).toBeInTheDocument();
  });

  it('renders a list of forms fetched from the server', async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/form builder/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter by/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create a new form/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /edit schema/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /download schema/i })).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: /filter table/i })).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeInTheDocument();
    expect(screen.getByText(formsResponse[0].name)).toBeInTheDocument();
  });

  it('clicking on "create a new form" button navigates to the "create form" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    const createFormButton = screen.getByRole('button', {
      name: /create a new form/i,
    });

    await user.click(createFormButton);

    expect(navigate).toHaveBeenCalledWith({
      to: expect.stringMatching(/form\-builder\/new/),
    });
  });

  it("clicking the form name navigates to the form's edit page", async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    const link = screen.getByRole('link', { name: formsResponse[0].name });
    expect(link).toBeInTheDocument();
  });

  it('clicking on "edit schema" button navigates to the "edit schema" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    const editSchemaButton = screen.getByRole('button', {
      name: /edit schema/i,
    });

    await user.click(editSchemaButton);

    expect(navigate).toHaveBeenCalledWith({
      to: expect.stringMatching(/form\-builder\/edit/),
    });
  });

  it('clicking on "download schema" button downloads the schema', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    const downloadSchemaButton = screen.getByRole('button', {
      name: /download schema/i,
    });

    await user.click(downloadSchemaButton);

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('clicking the "delete button" lets you delete a form', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    } as unknown as OpenmrsFetchResponse);

    mockedDeleteForm.mockResolvedValue({} as FetchResponse<Record<string, never>>);

    mockUsePagination.mockImplementation(
      () =>
        ({
          currentPage: 1,
          goTo: () => {},
          results: formsResponse,
        }) as unknown as PaginationData,
    );

    renderDashboard();

    await waitForLoadingToFinish();

    const deleteButton = screen.getByRole('button', { name: /delete schema/i });
    expect(deleteButton).toBeInTheDocument();

    await user.click(deleteButton);

    const modal = screen.getByRole('presentation');
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent(/delete form/i);
    expect(modal).toHaveTextContent(/are you sure you want to delete this form?/i);
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /danger delete/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /danger delete/i }));
  });
});

function renderDashboard() {
  renderWithSwr(<Dashboard />);
}
