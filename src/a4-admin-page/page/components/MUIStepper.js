import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Check from "@mui/icons-material/Check";
import Avatar from "@mui/material/Avatar";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { Typography, Tooltip, Box, Card, CardContent } from "@mui/material";
import dayjs from "dayjs";

export default function CustomizedSteppers({ row }) {
  const levelUp = useMemo(() => row.original.Level - 1, [row]);
  const QontoStepIconRoot = styled("div")(({ theme, ownerState }) => ({
    color: theme.palette.mode === "dark" ? theme.palette.grey[700] : "#eaeaf0",
    display: "flex",
    height: 22,
    alignItems: "center",
    ...(ownerState.active && {
      color: "#784af4",
    }),
    "& .QontoStepIcon-completedIcon": {
      color: "#784af4",
      zIndex: 1,
      fontSize: 18,
    },
    "& .QontoStepIcon-circle": {
      width: 8,
      height: 8,
      borderRadius: "50%",
      backgroundColor: "currentColor",
    },
  }));

  function QontoStepIcon(props) {
    const { active, completed, className } = props;

    return (
      <QontoStepIconRoot ownerState={{ active }} className={className}>
        {completed ? (
          <Check className="QontoStepIcon-completedIcon" />
        ) : (
          <div className="QontoStepIcon-circle" />
        )}
      </QontoStepIconRoot>
    );
  }

  QontoStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
  };

  const ColorlibConnector = styled(StepConnector)(({ theme }) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 22,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        backgroundImage:
          "linear-gradient( 95deg,rgb(242,113,33) 0%,rgb(233,64,87) 50%,rgb(138,35,135) 100%)",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      height: 3,
      border: 0,
      backgroundColor:
        theme.palette.mode === "dark" ? theme.palette.grey[800] : "#eaeaf0",
      borderRadius: 1,
    },
  }));

  const ColorlibStepIconRoot = styled("div")(({ theme, ownerState }) => ({
    backgroundColor:
      theme.palette.mode === "dark" ? theme.palette.grey[700] : "#ccc",
    zIndex: 1,
    color: "#fff",
    width: 50,
    height: 50,
    display: "flex",
    borderRadius: "50%",
    justifyContent: "center",
    alignItems: "center",
    ...(ownerState.active && {
      backgroundImage:
        "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
      boxShadow: "0 4px 10px 0 rgba(0,0,0,.25)",
    }),
    ...(ownerState.completed && {
      backgroundImage:
        "linear-gradient( 136deg, rgb(242,113,33) 0%, rgb(233,64,87) 50%, rgb(138,35,135) 100%)",
    }),
  }));

  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;

    const version1 = {
      1: (
        <Tooltip title={row.original.Requester_ID}>
          <Avatar alt="Remy Sharp" src={row.original.Requester_Avatar} />
        </Tooltip>
      ),
      2: (
        <Tooltip title={row.original.Approver3_ID}>
          <Avatar alt="Remy Sharp1" src={row.original.Approver3_Avatar} />
        </Tooltip>
      ),
    };
    const version2 = {
      1: (
        <Tooltip title={row.original.Requester_ID}>
          <Avatar alt="Remy Sharp" src={row.original.Requester_Avatar} />
        </Tooltip>
      ),
      2: (
        <Tooltip title={row.original.Approver2_ID}>
          <Avatar alt="Remy Sharp1" src={row.original.Approver2_Avatar} />
        </Tooltip>
      ),
    };
    const version3 = {
      1: (
        <Tooltip title={row.original.Requester_ID}>
          <Avatar alt="Remy Sharp" src={row.original.Requester_Avatar} />
        </Tooltip>
      ),
      2: (
        <Tooltip title={row.original.Approver1_ID}>
          <Avatar alt="Remy Sharp1" src={row.original.Approver1_Avatar} />
        </Tooltip>
      ),
      3: (
        <Tooltip title={row.original.Approver3_ID}>
          <Avatar alt="Remy Sharp2" src={row.original.Approver3_Avatar} />
        </Tooltip>
      ),
    };
    const version4 = {
      1: (
        <Tooltip title={row.original.Requester_ID}>
          <Avatar alt="Remy Sharp" src={row.original.Requester_Avatar} />
        </Tooltip>
      ),
      2: (
        <Tooltip title={row.original.Approver1_ID}>
          <Avatar alt="Remy Sharp1" src={row.original.Approver1_Avatar} />
        </Tooltip>
      ),
      3: (
        <Tooltip title={row.original.Approver2_ID}>
          <Avatar alt="Remy Sharp2" src={row.original.Approver2_Avatar} />
        </Tooltip>
      ),
      4: (
        <Tooltip title={row.original.Approver3_ID}>
          <Avatar alt="Remy Sharp4" src={row.original.Approver3_Avatar} />
        </Tooltip>
      ),
    };
    const version5 = {
      1: (
        <Tooltip title={row.original.Requester_ID}>
          <Avatar alt="Remy Sharp" src={row.original.Requester_Avatar} />
        </Tooltip>
      ),
      2: (
        <Tooltip title={row.original.Approver3_ID}>
          <Avatar alt="Remy Sharp1" src={row.original.Approver_Avatar} />
        </Tooltip>
      ),
    };

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {row.original.Version === 1
          ? version1[String(props.icon)]
          : row.original.Version === 2
            ? version2[String(props.icon)]
            : row.original.Version === 3
              ? version3[String(props.icon)]
              : row.original.Version === 4
                ? version4[String(props.icon)]
                : version5[String(props.icon)]}
      </ColorlibStepIconRoot>
    );
  }

  ColorlibStepIcon.propTypes = {
    /**
     * Whether this step is active.
     * @default false
     */
    active: PropTypes.bool,
    className: PropTypes.string,
    /**
     * Mark the step as completed. Is passed to child components.
     * @default false
     */
    completed: PropTypes.bool,
    /**
     * The label displayed in the step icon.
     */
    icon: PropTypes.node,
  };
  return (
    <Stack sx={{ width: "100%" }} spacing={4}>
      {row.original.Version === 1 && (
        <Stepper
          alternativeLabel
          activeStep={row.original.Level - 1}
          connector={<ColorlibConnector />}
        >
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Requester_Status === "Илгээсэн"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Requester_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {dayjs(row.original.Requester_TimeStamps).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 150 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver3_Status === "Шийдвэрлэсэн"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver3_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Approver3_TimeStamps &&
                      dayjs(row.original.Approver3_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
        </Stepper>
      )}
      {row.original.Version === 2 && (
        <Stepper
          alternativeLabel
          activeStep={row.original.Level - 1}
          connector={<ColorlibConnector />}
        >
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Requester_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Requester_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Requester_TimeStamps &&
                      dayjs(row.original.Requester_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver2_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver2_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver2_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {dayjs(row.original.Approver2_TimeStamps).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver2_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
        </Stepper>
      )}
      {row.original.Version === 3 && (
        <Stepper
          alternativeLabel
          activeStep={levelUp}
          connector={<ColorlibConnector />}
        >
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Requester_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Requester_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Requester_TimeStamps &&
                      dayjs(row.original.Requester_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 150 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver1_Status === "approved"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver1_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver1_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {dayjs(row.original.Approver1_TimeStamps).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver1_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver3_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver3_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {dayjs(row.original.Approver3_TimeStamps).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
        </Stepper>
      )}
      {row.original.Version === 4 && (
        <Stepper
          alternativeLabel
          activeStep={row.original.Level - 1}
          connector={<ColorlibConnector />}
        >
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Requester_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Requester_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Requester_TimeStamps &&
                      dayjs(row.original.Requester_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 150 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver1_Status === "approved"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver1_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver1_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Approver1_TimeStamps &&
                      dayjs(row.original.Approver1_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver1_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver2_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver2_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver2_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Approver2_TimeStamps &&
                      dayjs(row.original.Approver2_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver2_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver3_Status === "Шийдвэрлэж байна"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver3_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Approver3_TimeStamps &&
                      dayjs(row.original.Approver3_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver3_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
        </Stepper>
      )}
      {row.original.Version === 5 && (
        <Stepper
          alternativeLabel
          activeStep={levelUp}
          connector={<ColorlibConnector />}
        >
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Requester_Status === "Илгээсэн"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Requester_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {row.original.Requester_TimeStamps &&
                      dayjs(row.original.Requester_TimeStamps).format(
                        "YYYY/MM/DD HH:mm:ss",
                      )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Requester_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
          <Step>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              <Card sx={{ minWidth: 100 }}>
                <CardContent
                  component="div"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="span"
                    sx={(theme) => ({
                      backgroundColor:
                        row.original.Approver_Status === "Шийдвэрлэсэн"
                          ? theme.palette.success.main
                          : theme.palette.warning.dark,
                      borderRadius: "0.25rem",
                      color: "#fff",
                      maxWidth: "14ch",
                      p: "0.25rem",
                    })}
                  >
                    {row.original.Approver_Status}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver_Major}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ marginTop: 1 }}
                  >
                    {dayjs(row.original.Approver_TimeStamps).format(
                      "YYYY/MM/DD HH:mm:ss",
                    )}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {row.original.Approver_Comment}
                  </Typography>
                </CardContent>
              </Card>
            </StepLabel>
          </Step>
        </Stepper>
      )}
    </Stack>
  );
}
