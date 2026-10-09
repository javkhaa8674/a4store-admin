// SignaturePad.js
import React, { useRef, useState } from "react";
import { Button, Box, LinearProgress, useTheme } from "@mui/material";
import SignatureCanvas from "react-signature-canvas";

const SignaturePad = ({ signature, setSignature }) => {
  const theme = useTheme();
  const sigCanvas = useRef(null);

  // Clear the canvas
  const clearSignature = () => sigCanvas.current.clear();

  // Save the signature as an image URL
  const saveSignature = () => {
    if (sigCanvas.current.isEmpty()) {
      alert("Please provide a signature first!");
      return;
    }
    const signatureDataURL = sigCanvas.current.toDataURL("image/png");
    setSignature(signatureDataURL);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 600,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: 2,
      }}
    >
      {!signature ? (
        <>
          <Box
            sx={{
              backgroundColor: theme.palette.grey[100],
            }}
          >
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{ width: 500, height: 200, className: "sigCanvas" }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Button variant="text" onClick={clearSignature}>
              Арилгах
            </Button>
            <Button variant="contained" onClick={saveSignature}>
              Хадгалах
            </Button>
          </Box>
        </>
      ) : (
        <Box
          sx={{
            width: "200",
            justifyContent: "center",
            backgroundColor: theme.palette.grey[100],
          }}
        >
          <img src={signature} alt="Signature" width="200" />
        </Box>
      )}
    </Box>
  );
};

export default SignaturePad;
