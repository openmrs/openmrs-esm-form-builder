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
// import IconButton from
// import { Edit } from '@carbon/react/icons';
import styles from "./dashboard.css";
import { Download, Edit } from "@carbon/icons-react/next";

const headers = [
  {
    header: "Name",
    key: "name",
  },
  {
    header: "Version",
    key: "version",
  },
  {
    header: "Published",
    key: "published",
  },
  {
    header: "Retired",
    key: "retired",
  },
  {
    header: "Actions",
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
        {"Yes"}
      </Tag>
    ),
    retired: (
      <Tag type="green" size="sm" title="Clear Filter">
        {"No"}
      </Tag>
    ),
    actions: (
      <>
        <Button
          renderIcon={Edit}
          kind={"ghost"}
          iconDescription="Edit Form"
          hasIconOnly
        />
        <Button
          renderIcon={Download}
          kind={"ghost"}
          iconDescription="Download"
          hasIconOnly
        />
      </>
    ),
  },
];

const Dashboard: React.FC = () => {
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
          <TableContainer title="Form Builder" {...getTableContainerProps()}>
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
