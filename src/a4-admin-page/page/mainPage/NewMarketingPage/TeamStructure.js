import PersonIcon from "@mui/icons-material/Person";
import { OrganizationChart } from "primereact/organizationchart";
import { useEffect, useState } from "react";

const TeamStructure = ({ data }) => {
  const [selection, setSelection] = useState([]);
  const [strucruredData, setStructuredData] = useState([
    {
      expanded: true,
      type: "person",
      data: {
        name: "Уншиж байна",
        phone: "",
      },
      children: [],
    },
  ]);

  useEffect(() => {
    const phoneNumber = localStorage.getItem("phoneNumber");
    setStructuredData(buildNestedStructure(data, phoneNumber));
  }, [data]);

  const buildNestedStructure = (arr) => {
    let map = {};
    let roots = [];
    arr[0].SponsorId = null;
    arr[0].SponsorName = null;
    // Build the map
    arr.forEach((item) => {
      map[item.Name + item.phoneNumber] = {
        expanded: true,
        type: "person",
        data: { ...item },
        children: [],
      };
    });
    console.log("map", map);
    // Build the hierarchy
    arr.forEach((item) => {
      if (!item.SponsorName) {
        roots.push(map[item.Name + item.phoneNumber]);
      } else {
        map[item.SponsorName + item.SponsorId].children.push(
          map[item.Name + item.phoneNumber],
        );
      }
    });
    console.log("roots", roots);
    return roots;
  };

  const nodeTemplate = (node) => {
    if (node.type === "person") {
      return (
        <div
          style={{ boxShadow: "0 12px 25px rgba(0, 0, 0, 0.2)" }}
          className="flex flex-column"
        >
          <div
            style={{
              display: "flex",
              flex: 1,
              backgroundColor: "#ffffff",
              padding: 20,
              borderRadius: 20,
              flexDirection: "column",
              alignItems: "center",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.1)",
              transition: "all 0.3s ease-in-out",
              transform: "scale(1)",
              ":hover": {
                transform: "scale(1.08)",
                boxShadow: "0 12px 25px rgba(0, 0, 0, 0.2)",
              },
            }}
          >
            <PersonIcon
              style={{
                fontSize: 60,
                color: "#fff",
                background: "linear-gradient(45deg, #ff6ec7, #ff9a8b)",
                borderRadius: "50%",
                padding: 10,
              }}
            />
            <span
              style={{
                fontWeight: 400,
                fontSize: 16,
                color: "#666",
                marginTop: 10,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {node.data.phoneNumber}
            </span>
            <span
              style={{
                fontWeight: 700,
                fontSize: 18,
                color: "#333",
                marginTop: 5,
                textShadow: "1px 1px 2px rgba(0, 0, 0, 0.1)",
              }}
            >
              {node.data.Name}
            </span>
            <span
              style={{
                display: "flex",
                flex: 1,
                background: "linear-gradient(45deg, #ff6ec7, #ff9a8b)",
                padding: "8px 25px",
                borderRadius: 30,
                fontWeight: "bold",
                color: "",
                fontSize: 18,
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
                marginTop: 15,
                textTransform: "uppercase",
              }}
            >
              Үе: {node.data.Level}
            </span>
          </div>
        </div>
      );
    }
    return node.label;
  };

  return (
    <>
      <div className="card overflow-x-auto">
        <OrganizationChart
          value={strucruredData}
          selectionMode="multiple"
          selection={selection}
          onSelectionChange={(e) => setSelection(e.data)}
          nodeTemplate={nodeTemplate}
        />
      </div>
    </>
  );
};

export default TeamStructure;
