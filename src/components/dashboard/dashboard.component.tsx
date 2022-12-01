import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Layer,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  Tile,
} from "@carbon/react";
import { Add, DocumentImport, Download, Edit } from "@carbon/react/icons";
import { navigate, useLayoutType } from "@openmrs/esm-framework";

import { usePocForms } from "../../hooks/usePocForms";
import EmptyState from "../empty-state/empty-state.component";
import ErrorState from "../error-state/error-state.component";
import styles from "./dashboard.scss";

function CustomTag({ condition }) {
  const { t } = useTranslation();

  return condition ? (
    <Tag type="green" size="md" title="Clear Filter">
      {t("yes", "Yes")}
    </Tag>
  ) : (
    <Tag type="red" size="md" title="Clear Filter">
      {t("no", "No")}
    </Tag>
  );
}

function ActionButtons({ form }) {
  const { t } = useTranslation();

  return form?.resources?.length == 0 || !form?.resources?.[0] ? (
    <Button
      className={styles.importButton}
      renderIcon={DocumentImport}
      onClick={() => navigate({ to: `form-builder/edit/${form.uuid}` })}
      kind={"ghost"}
      iconDescription={t("import", "Import")}
      hasIconOnly
    />
  ) : (
    <>
      <Button
        className={styles.editButton}
        enterDelayMs={300}
        renderIcon={Edit}
        onClick={() =>
          navigate({
            to: `${window.spaBase}/form-builder/edit/${form.uuid}`,
          })
        }
        kind={"ghost"}
        iconDescription={t("edit", "Edit")}
        hasIconOnly
      />
      <Button
        className={styles.downloadButton}
        enterDelayMs={300}
        renderIcon={Download}
        kind={"ghost"}
        iconDescription={t("download", "Download")}
        hasIconOnly
      />
    </>
  );
}

const FormsList = ({ forms, isValidating, t }) => {
  const isTablet = useLayoutType() === "tablet";

  const tableHeaders = [
    {
      header: t("name", "Name"),
      key: "name",
    },
    {
      header: t("version", "Version"),
      key: "version",
    },
    {
      header: t("published", "Published"),
      key: "published",
    },
    {
      header: t("retired", "Retired"),
      key: "retired",
    },
    {
      header: t("schemaActions", "Schema actions"),
      key: "actions",
    },
  ];

  const tableRows = useMemo(
    () =>
      forms?.map((form) => ({
        ...form,
        id: form.uuid,
        published: <CustomTag condition={form.published} />,
        retired: <CustomTag condition={form.retired} />,
        actions: <ActionButtons form={form} />,
      })),
    [forms]
  );

  return (
    <>
      <div className={styles.buttonContainer}>
        <Button
          size="md"
          kind="secondary"
          className={styles.createFormButton}
          renderIcon={(props) => <Add size={16} {...props} />}
          onClick={() =>
            navigate({
              to: `${window.spaBase}/form-builder/new`,
            })
          }
          iconDescription={t("createNewForm", "Create new form")}
        >
          {t("createNewForm", "Create new form")}
        </Button>
      </div>
      <DataTable
        rows={tableRows}
        headers={tableHeaders}
        size={isTablet ? "lg" : "xs"}
        useZebraStyles
      >
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getToolbarProps,
          onInputChange,
        }) => (
          <>
            <TableContainer
              {...getToolbarProps()}
              className={styles.tableContainer}
            >
              <TableToolbar>
                <TableToolbarContent>
                  <Layer>
                    <TableToolbarSearch
                      className={styles.search}
                      expanded
                      onChange={onInputChange}
                      placeholder={t("searchThisList", "Search this list")}
                      size={isTablet ? "lg" : "sm"}
                    />
                  </Layer>
                </TableToolbarContent>
              </TableToolbar>
              <Table {...getTableProps()} className={styles.table}>
                <TableHead>
                  <TableRow>
                    {headers.map((header) => (
                      <TableHeader {...getHeaderProps({ header })}>
                        {header.header}
                      </TableHeader>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {rows.length === 0 ? (
              <div className={styles.tileContainer}>
                <Tile className={styles.tile}>
                  <div className={styles.tileContent}>
                    <p className={styles.content}>
                      {t(
                        "noMatchingFormsToDisplay",
                        "No matching forms to display"
                      )}
                    </p>
                    <p className={styles.helper}>
                      {t("checkFilters", "Check the filters above")}
                    </p>
                  </div>
                </Tile>
              </div>
            ) : null}
          </>
        )}
      </DataTable>
    </>
  );
};

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { error, forms, isLoading, isValidating } = usePocForms();

  return (
    <div className={styles.container}>
      <h3 className={styles.heading}>{t("formBuilder", "Form Builder")}</h3>
      {(() => {
        if (error) {
          return <ErrorState error={error} />;
        }

        if (isLoading) {
          return <DataTableSkeleton role="progressbar" />;
        }

        if (forms.length === 0) {
          return <EmptyState />;
        }

        return <FormsList forms={forms} isValidating={isValidating} t={t} />;
      })()}
    </div>
  );
};

export default Dashboard;
