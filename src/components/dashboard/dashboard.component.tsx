import React from "react";
import {
  DataTable,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableBody,
  TableCell,
  TableContainer,
  TableToolbar,
  TableToolbarSearch,
  TableToolbarAction,
  TableToolbarMenu,
  TableToolbarContent,
  Button,
  Tag,
  Link,
} from "@carbon/react";
import { navigate } from "@openmrs/esm-framework";
import { Download, Edit, DocumentImport } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { usePOCForms } from "../../api/usePOCForms";
import styles from "./dashboard.css";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const { forms } = usePOCForms();
  const rows = [];
  forms?.map((form, key) =>
    rows.push({
      id: `${key}`,
      name: form.name,
      version: form.version,
      published: form.published ? (
        <Tag type="green" size="sm" title="Clear Filter">
          {t("yes", "Yes")}
        </Tag>
      ) : (
        <Tag type="red" size="sm" title="Clear Filter">
          {t("no", "No")}
        </Tag>
      ),
      retired: form.retired ? (
        <Tag type="red" size="sm" title="Clear Filter">
          {t("yes", "Yes")}
        </Tag>
      ) : (
        <Tag type="green" size="sm" title="Clear Filter">
          {t("no", "No")}
        </Tag>
      ),
      actions:
        form.resources.length == 0 || !form.resources[0] ? (
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
              renderIcon={Edit}
              onClick={() =>
                navigate({
                  to: `${window.spaBase}/form-builder/edit/${form.uuid}`,
                })
              }
              kind={"ghost"}
              iconDescription={t("editForm", "Edit Form")}
              hasIconOnly
            />
            <Button
              className={styles.downloadButton}
              renderIcon={Download}
              kind={"ghost"}
              iconDescription={t("download", "Download")}
              hasIconOnly
            />
          </>
        ),
    })
  );

  const headers = [
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
      header: t("actions", "Actions"),
      key: "actions",
    },
  ];

  return (
    <div>
      <DataTable rows={rows} headers={headers} className={styles.wrapContainer}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          getToolbarProps,
          onInputChange,
          getTableContainerProps,
        }) => (
          <TableContainer
            title={t("formBuilder", "Form builder")}
            {...getTableContainerProps()}
          >
            <div className={styles.toolbar}>
              <TableToolbar
                {...getToolbarProps()}
                aria-label="data table toolbar"
              >
                <TableToolbarContent>
                  <TableToolbarSearch onChange={onInputChange} />
                  <TableToolbarMenu>
                    <TableToolbarAction onClick={() => {}}>
                      POC
                    </TableToolbarAction>
                  </TableToolbarMenu>
                  <Button
                    onClick={() =>
                      navigate({
                        to: `${window.spaBase}/form-builder/edit/new`,
                      })
                    }
                  >
                    {t("createNew", "Create New")}
                  </Button>
                </TableToolbarContent>
              </TableToolbar>
            </div>
            <Table {...getTableProps()}>
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
                {rows.length > 0 ? (
                  rows.map((row) => (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>{cell.value}</TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <div className={styles.emptyContainer}>
                    There are No forms found.
                    <Link
                      onClick={() =>
                        navigate({
                          to: `${window.spaBase}/form-builder/edit/new`,
                        })
                      }
                    >
                      {t("createNew", "Create New")}
                    </Link>
                  </div>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>
    </div>
  );
};

export default Dashboard;
