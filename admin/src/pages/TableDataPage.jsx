import React from "react";
import MasterLayout from "../masterLayout/MasterLayout";
import Breadcrumb from "../components/Breadcrumb";
import TableDataLayer from "../components/TableDataLayer";

const TableDataPage = () => {
  return (
    <>

      {/* MasterLayout */}
      <MasterLayout>

        {/* Breadcrumb */}
        <Breadcrumb title="Data Table" />

        {/* TableDataLayer */}
        <TableDataLayer />

      </MasterLayout>

    </>
  );
};

export default TableDataPage; 
