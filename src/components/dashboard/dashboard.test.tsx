import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { navigate, openmrsFetch } from "@openmrs/esm-framework";
import { renderWithSwr, waitForLoadingToFinish } from "../../test-helpers";
import { deleteForm } from "../../forms.resource";
import Dashboard from "./dashboard.component";

const mockedOpenmrsFetch = openmrsFetch as jest.Mock;
const mockedDeleteForm = deleteForm as jest.Mock;

jest.mock("../../forms.resource", () => ({
  deleteForm: jest.fn(),
}));

const formsResponse = [
  {
    uuid: "2ddde996-b1c3-37f1-a53e-378dd1a4f6b5",
    name: "Test Form 1",
    encounterType: {
      uuid: "dd528487-82a5-4082-9c72-ed246bd49591",
      name: "Consultation",
    },
    version: "1",
    published: true,
    retired: false,
    resources: [
      {
        uuid: "ea27fd4f-7a4d-4869-8855-5b890c8fed56",
        name: "JSON schema",
        dataType: "AmpathJsonSchema",
        valueReference: "511efba8-f08f-4544-a6da-6a6fa2497b9e",
      },
    ],
  },
];

describe("Dashboard", () => {
  it("renders an empty state view if no forms are available", async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({ data: { results: [] } });

    renderDashboard();

    await waitForLoadingToFinish();

    expect(
      screen.getByRole("heading", { name: /form builder/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /forms/i })).toBeInTheDocument();
    expect(screen.getByTitle(/empty data illustration/i)).toBeInTheDocument();
    expect(
      screen.getByText(/there are no forms to display/i)
    ).toBeInTheDocument();
    expect(screen.getByText(/create a new form/i)).toBeInTheDocument();
  });

  it("renders a list of forms fetched from the server", async () => {
    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });

    renderDashboard();

    await waitForLoadingToFinish();

    expect(
      screen.getByRole("heading", { name: /form builder/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /filter by publish status/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /create a new form/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /edit schema/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /download schema/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("search", { name: /filter table/i })
    ).toBeInTheDocument();
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText(/Test Form 1/i)).toBeInTheDocument();
  });

  it("searching for a form by name filters the list of forms", async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });

    renderDashboard();

    await waitForLoadingToFinish();

    expect(screen.getByText(/Test Form 1/i)).toBeInTheDocument();

    const searchbox = screen.getByRole("searchbox");

    await waitFor(() => user.type(searchbox, "COVID"));

    expect(screen.queryByText(/Test Form 1/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/no matching forms to display/i)
    ).toBeInTheDocument();
  });

  it('filters the list of forms by "published" status', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });

    renderDashboard();

    await waitForLoadingToFinish();

    const publishStatusFilter = screen.getByRole("button", {
      name: /filter by publish status/i,
    });

    await waitFor(() => user.click(publishStatusFilter));
    await waitFor(() =>
      user.click(screen.getByRole("option", { name: /unpublished/i }))
    );

    expect(screen.queryByText(/Test Form 1/i)).not.toBeInTheDocument();
    expect(
      screen.getByText(/no matching forms to display/i)
    ).toBeInTheDocument();
  });

  it('clicking on "create a new form" button navigates to the "create form" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });

    renderDashboard();

    await waitForLoadingToFinish();

    const createFormButton = screen.getByRole("button", {
      name: /create a new form/i,
    });

    await user.click(createFormButton);

    expect(navigate).toHaveBeenCalledWith({
      to: expect.stringMatching(/form\-builder\/new/),
    });
  });

  it('clicking on "edit schema" button navigates to the "edit schema" page', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });

    renderDashboard();

    await waitForLoadingToFinish();

    const editSchemaButton = screen.getByRole("button", {
      name: /edit schema/i,
    });

    await waitFor(() => user.click(editSchemaButton));

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
    });

    renderDashboard();

    await waitForLoadingToFinish();

    const downloadSchemaButton = screen.getByRole("button", {
      name: /download schema/i,
    });

    await waitFor(() => user.click(downloadSchemaButton));

    expect(window.URL.createObjectURL).toHaveBeenCalled();
  });

  it('clicking the "delete button" lets you delete a form', async () => {
    const user = userEvent.setup();

    mockedOpenmrsFetch.mockReturnValueOnce({
      data: {
        results: formsResponse,
      },
    });
    mockedDeleteForm.mockResolvedValue({});

    renderDashboard();

    await waitForLoadingToFinish();

    const deleteButton = screen.getByRole("button", { name: /delete schema/i });
    expect(deleteButton).toBeInTheDocument();

    await waitFor(() => user.click(deleteButton));

    const modal = screen.getByRole("presentation");
    expect(modal).toBeInTheDocument();
    expect(modal).toHaveTextContent(/delete form/i);
    expect(modal).toHaveTextContent(
      /are you sure you want to delete this form?/i
    );
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /danger delete/i })
    ).toBeInTheDocument();

    await waitFor(() =>
      user.click(screen.getByRole("button", { name: /danger delete/i }))
    );
  });
});

function renderDashboard() {
  renderWithSwr(<Dashboard />);
}
