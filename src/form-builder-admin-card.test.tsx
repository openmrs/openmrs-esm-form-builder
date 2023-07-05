import React from "react";
import { render, waitFor } from "@testing-library/react";
import FormBuilderCardLink from "./form-builder-admin-card-link.component";
import { navigate } from "@openmrs/esm-framework";
import userEvent from '@testing-library/user-event'

const navigateMock = navigate as jest.Mock;

jest.mock("@openmrs/esm-framework", () => ({
    navigate: jest.fn(),
}));

describe("FormBuilderCardLink", () => {
    it("renders the header and content correctly", () => {
        const { getByText } = render(<FormBuilderCardLink />);
        const header = getByText("Manage Forms");
        const content = getByText("Form Builder");
        expect(header).toBeInTheDocument();
        expect(content).toBeInTheDocument();
    });

    it("navigates when the clickable tile is clicked", async () => {
        const { getByText } = render(<FormBuilderCardLink />);
        const clickableTile = getByText("Manage Forms");
    
        userEvent.click(clickableTile);
        await waitFor(() => expect(navigateMock).toBeCalledWith({ to: `\${openmrsSpaBase}/form-builder` }));
    });
});
