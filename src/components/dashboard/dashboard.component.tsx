import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  DataTable,
  DataTableSkeleton,
  Dropdown,
  InlineLoading,
  InlineNotification,
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
import { navigate, useConfig, useLayoutType } from "@openmrs/esm-framework";

import { FilterProps } from "../../types";
import { useClobdata } from "../../hooks/useClobdata";
import { useForms } from "../../hooks/useForms";
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
  const { clobdata } = useClobdata(form);
  const formResources = form?.resources;

  const downloadableSchema = useMemo(
    () =>
      new Blob([JSON.stringify(clobdata, null, 2)], {
        type: "application/json",
      }),
    [clobdata]
  );

  return formResources.length == 0 || !form?.resources[0] ? (
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
        iconDescription={t("editSchema", "Edit schema")}
        hasIconOnly
        tooltipAlignment="start"
      />
      <a
        className={styles.downloadLink}
        download={`${form?.name}.json`}
        href={window.URL.createObjectURL(downloadableSchema)}
      >
        <Button
          className={styles.downloadButton}
          enterDelayMs={300}
          renderIcon={Download}
          kind={"ghost"}
          iconDescription={t("downloadSchema", "Download schema")}
          hasIconOnly
          tooltipAlignment="start"
        ></Button>
      </a>
    </>
  );
}

function FormsList({ forms, isValidating, t }) {
  const isTablet = useLayoutType() === "tablet";
  const [filter, setFilter] = useState("");
  const config = useConfig();

  const filteredRows = useMemo(() => {
    if (!filter) {
      return forms;
    }

    if (filter === "Published") {
      return forms.filter((form) => form.published);
    }

    if (filter === "Unpublished") {
      return forms.filter((form) => !form.published);
    }

    return forms;
  }, [filter, forms]);

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
      (filteredRows ? filteredRows : forms)?.map((form) => ({
        ...form,
        id: form.uuid,
        published: <CustomTag condition={form.published} />,
        retired: <CustomTag condition={form.retired} />,
        actions: <ActionButtons form={form} />,
      })),
    [filteredRows, forms]
  );

  const handlePublishStatusChange = ({ selectedItem }) =>
    setFilter(selectedItem);

  const handleFilter = ({
    rowIds,
    headers,
    cellsById,
    inputValue,
    getCellId,
  }: FilterProps): Array<string> => {
    return rowIds.filter((rowId) =>
      headers.some(({ key }) => {
        const cellId = getCellId(rowId, key);
        const filterableValue = cellsById[cellId].value;
        const filterTerm = inputValue.toLowerCase();

        return ("" + filterableValue).toLowerCase().includes(filterTerm);
      })
    );
  };

  return (
    <>
      {config.showSchemaSaveWarning && (
        <InlineNotification
          className={styles.warningMessage}
          kind="info"
          lowContrast
          title={t(
            "schemaSaveWarningMessage",
            "The dev3 server is ephemeral at best and can't be relied upon to save your schemas permanently. To avoid losing your work, please save your schemas to your local machine. Alternatively, upload your schema to the distro repo to have it persisted across server resets."
          )}
        />
      )}
      <div className={styles.flexContainer}>
        <div className={styles.filterContainer}>
          <Dropdown
            id="publishStatusFilter"
            initialSelectedItem={"All"}
            label=""
            titleText={
              t("filterByPublishedStatus", "Filter by publish status") + ":"
            }
            type="inline"
            items={["All", "Published", "Unpublished"]}
            onChange={handlePublishStatusChange}
          />
        </div>
        <div className={styles.backgroundDataFetchingIndicator}>
          <span>{isValidating ? <InlineLoading /> : null}</span>
        </div>
      </div>
      <DataTable
        filterRows={handleFilter}
        rows={tableRows}
        headers={tableHeaders}
        size={isTablet ? "sm" : "lg"}
        useZebraStyles
      >
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          onInputChange,
        }) => (
          <>
            <TableContainer className={styles.tableContainer}>
              <div className={styles.toolbarWrapper}>
                <TableToolbar className={styles.tableToolbar}>
                  <TableToolbarContent>
                    <TableToolbarSearch
                      onChange={onInputChange}
                      placeholder={t("searchThisList", "Search this list")}
                    />
                    <Button
                      kind="primary"
                      iconDescription={t("createNewForm", "Create a new form")}
                      renderIcon={(props) => <Add size={16} {...props} />}
                      onClick={() =>
                        navigate({
                          to: `${window.spaBase}/form-builder/new`,
                        })
                      }
                    >
                      {t("createNewForm", "Create a new form")}
                    </Button>
                  </TableToolbarContent>
                </TableToolbar>
              </div>
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
}

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { error, forms, isLoading, isValidating } = useForms();

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
