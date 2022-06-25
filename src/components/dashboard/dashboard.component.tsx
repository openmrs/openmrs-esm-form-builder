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
} from "carbon-components-react";
import styles from "./dashboard.css";
import { Download, Edit } from "@carbon/icons-react/next";
import { useTranslation } from "react-i18next";

const Dashboard: React.FC = () => {
  const { t } = useTranslation();

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

  const rows = [
    {
      id: "a",
      name: "POC Vitals",
      version: "1.0",
      published: (
        <Tag type="green" size="sm" title="Clear Filter">
          {t("yes", "Yes")}
        </Tag>
      ),
      retired: (
        <Tag type="green" size="sm" title="Clear Filter">
          {t("no", "No")}
        </Tag>
      ),
      actions: (
        <>
          <Button
            renderIcon={Edit}
            kind={"ghost"}
            iconDescription={t("editForm", "Edit Form")}
            hasIconOnly
          />
          <Button
            renderIcon={Download}
            kind={"ghost"}
            iconDescription={t("download", "Download")}
            hasIconOnly
          />
        </>
      ),
    },
  ];

  return (
    <div>
      <DataTable rows={rows} headers={headers}>
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
                    <TableToolbarAction>POC</TableToolbarAction>
                  </TableToolbarMenu>
                  <Button>Create New</Button>
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
        )}
      </DataTable>
    </div>
  );
};

export default Dashboard;
