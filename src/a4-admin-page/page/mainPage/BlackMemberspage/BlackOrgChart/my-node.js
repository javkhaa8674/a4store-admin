import React from "react";
import PropTypes from "prop-types";
import "./TreeView.css";

const propTypes = {
  nodeData: PropTypes.object.isRequired,
};

const TreeView = ({ nodeData }) => {
  // Default children to an empty array if not provided
  const children = nodeData.children || [];
  const selectNode = () => {};

  return (
    <div onClick={selectNode}>
      <div className="position">
        <div>
          ID: <strong>{nodeData.MemberId || "N/A"}</strong>
        </div>
      </div>
      <div
        className="fullname"
        style={{
          backgroundColor:
            Number(nodeData.Level) === 30
              ? "#039be5"
              : Number(nodeData.Level) === 300
                ? "#1de9b6"
                : "#f3f3f3",
          fontSize: "10px",
        }}
      >
        <div>
          <strong>{nodeData.QuantityName || "N/A"}</strong>
        </div>
        <div style={{ fontSize: "10px", fontStyle: "italic" }}>
          <strong>{nodeData.RankName}</strong>
        </div>
        {nodeData.System && (
          <div
            style={{ backgroundColor: "red", color: "white", borderRadius: 55 }}
          >
            Шилжсэн
          </div>
        )}
      </div>
      <div className="position">
        1-р эгнээ: <strong>{children.length || 0}</strong>
      </div>
    </div>
  );
};

TreeView.propTypes = propTypes;

export default TreeView;
