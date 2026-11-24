import Check from "@mui/icons-material/Check";
import { Box, Card, CardContent, Tooltip, Typography } from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Stack from "@mui/material/Stack";
import Step from "@mui/material/Step";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import StepLabel from "@mui/material/StepLabel";
import Stepper from "@mui/material/Stepper";
import { styled } from "@mui/material/styles";
import dayjs from "dayjs";
import PropTypes from "prop-types";
import { useMemo } from "react";

// ---------------------------------------------------------------------------
// Туслах: ApprovalType болон байгаа Approver талбаруудаас шатны төрлийг тодорхойлно
// ---------------------------------------------------------------------------
const getStepperConfig = (data) => {
  const {
    ApprovalType,
    Approver1_Status,
    Approver2_Status,
    Approver3_Status,
    Approver4_Status,
    Approver_Status,
  } = data || {};

  // 1) Хамгийн их шаттай (хуучин урсгал) — Approver4 байвал 5 шат
  if (Approver4_Status !== undefined) {
    return {
      key: "full",
      steps: [
        { kind: "requester" },
        { kind: "approver", n: 1 },
        { kind: "approver", n: 2 },
        { kind: "approver", n: 3 },
        { kind: "approver", n: 4 },
      ],
    };
  }

  // 2) Approver3 + Approver1/2 байвал 4 шат (Буцаалт хийх хуучин урсгал)
  if (Approver3_Status !== undefined && Approver1_Status !== undefined) {
    if (Approver2_Status !== undefined) {
      return {
        key: "full",
        steps: [
          { kind: "requester" },
          { kind: "approver", n: 1 },
          { kind: "approver", n: 2 },
          { kind: "approver", n: 3 },
        ],
      };
    }
    // Approver1 + Approver3 (manager урсгал)
    return {
      key: "manager",
      steps: [
        { kind: "requester" },
        { kind: "approver", n: 1 },
        { kind: "approver", n: 3 },
      ],
    };
  }

  // 3) Approver2 байвал 2 шат (finance урсгал)
  if (Approver2_Status !== undefined) {
    return {
      key: "finance",
      steps: [{ kind: "requester" }, { kind: "approver", n: 2 }],
    };
  }

  // 4) Approver3 байвал 2 шат (system урсгал)
  if (Approver3_Status !== undefined) {
    return {
      key: "system",
      steps: [{ kind: "requester" }, { kind: "approver", n: 3 }],
    };
  }

  // 5) Approver (шинэ system шууд) — 2 шат
  if (Approver_Status !== undefined) {
    return {
      key: "systemDirect",
      steps: [{ kind: "requester" }, { kind: "approver", n: "direct" }],
    };
  }

  // 6) Default — ApprovalType-аас хамааруулж 2 шат (Approver)
  switch (ApprovalType) {
    case "E-баримт олголт":
    case "Бүтээгдэхүүн олголт":
      return {
        key: "systemDirect",
        steps: [{ kind: "requester" }, { kind: "approver", n: "direct" }],
      };
    case "Буцаалт хийх":
    case "Уригч солих":
    case "Спонсор солих":
    case "Бусад":
    case "Нууц үг солиулах":
    case "Худалдан авалт хийж болохгүй байгаа":
    case "Дансны дугаар солих":
    case "Овог солих":
    case "Нэр солих":
    default:
      return {
        key: "systemDirect",
        steps: [{ kind: "requester" }, { kind: "approver", n: "direct" }],
      };
  }
};

// ---------------------------------------------------------------------------
// Туслах: Цуцлалтын төлөв эсэхийг шалгана
// ---------------------------------------------------------------------------
const cancelStatuses = ["Цуцалсан", "Цуцлагдсан", "cancelled"];

const isCancel = (status) => cancelStatuses.includes(status);

// ---------------------------------------------------------------------------
// Туслах: Цуцлалтыг эхлүүлсэн approver-ийн дугаарыг тодорхойлно
// Approver_Status нь цуцлалтын төлөвтэй бол Level-тэй тохирох N-ийг буцаана
// ---------------------------------------------------------------------------
const getCancellerStepNumber = (data) => {
  if (!data || !isCancel(data.Approver_Status)) return null;

  // Approver_* нь цуцлалтыг эхлүүлсэн хүний мэдээлэл.
  // Аль шатанд хамаарахыг Level-ээр тодорхойлно.
  const level = Number(data.Level);
  if (!Number.isFinite(level) || level < 1) return null;

  // config.steps дотор Level-тэй тохирох approver байгаа эсэхийг шалгана
  // (Level 1 = requester, Level 2 = эхний approver, ...)
  return level;
};

// ---------------------------------------------------------------------------
// Туслах: Тухайн approver-ийн талбаруудыг авах (direct = Approver_*)
// Цуцлалтыг эхлүүлсэн хүн дээр л direct-ийн comment/цагийг харуулна
// ---------------------------------------------------------------------------
const getApproverFields = (data, n, cancellerStep) => {
  if (n === "direct") {
    return {
      id: data.Approver_ID,
      avatar: data.Approver_Avatar,
      major: data.Approver_Major,
      status: data.Approver_Status,
      comment: data.Approver_Comment,
      timeStamps: data.Approver_TimeStamps,
    };
  }

  const p = `Approver${n}_`;
  const ownComment = data[`${p}Comment`];
  const ownTimeStamps = data[`${p}TimeStamps`];
  const ownStatus = data[`${p}Status`];

  // Энэ шат нь цуцлалтыг эхлүүлсэн хүн мөн эсэх
  const isCanceller =
    cancellerStep !== null && Number(n) === Number(cancellerStep);

  // Цуцлалтыг эхлүүлсэн хүн бол direct-ийн comment/цагийг ашиглана
  const comment = ownComment || (isCanceller ? data.Approver_Comment : "");
  const timeStamps =
    ownTimeStamps ?? (isCanceller ? data.Approver_TimeStamps : null);

  return {
    id: data[`${p}ID`] || (isCanceller ? data.Approver_ID : ""),
    avatar: data[`${p}Avatar`] || (isCanceller ? data.Approver_Avatar : ""),
    major: data[`${p}Major`] || (isCanceller ? data.Approver_Major : ""),
    status: ownStatus || (isCanceller ? data.Approver_Status : ""),
    comment: comment || "",
    timeStamps: timeStamps ?? null,
  };
};

const successStatuses = ["Шийдвэрлэсэн", "Илгээсэн", "approved"];

const isSuccess = (status) => successStatuses.includes(status);

// ---------------------------------------------------------------------------
// Styled компонентууд (компонентын гадна тодорхойлж, дахин үүсэхээс сэргийлнэ)
// ---------------------------------------------------------------------------
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
  active: PropTypes.bool,
  className: PropTypes.string,
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

export default function CustomizedSteppers({ row }) {
  const data = row.original;

  const config = useMemo(() => getStepperConfig(data), [data]);

  // Цуцлалтыг эхлүүлсэн approver-ийн дугаар (Level)
  const cancellerStep = useMemo(() => getCancellerStepNumber(data), [data]);

  // Requester + Approver-уудын нийт шат
  const totalSteps = config.steps.length;

  // Идэвхтэй шат: Level - 1, гэхдээ [0 .. totalSteps-1] хязгаарт
  const activeStep = useMemo(() => {
    const level = Number(data.Level) || 1;
    const idx = level - 1;
    if (idx < 0) return 0;
    if (idx > totalSteps - 1) return totalSteps - 1;
    return idx;
  }, [data.Level, totalSteps]);

  // --------------------------- Step Icon ---------------------------
  function ColorlibStepIcon(props) {
    const { active, completed, className } = props;
    const stepIndex = Number(props.icon) - 1;
    const stepConfig = config.steps[stepIndex];

    let avatarNode = null;

    if (!stepConfig) {
      avatarNode = null;
    } else if (stepConfig.kind === "requester") {
      avatarNode = (
        <Tooltip title={data.Requester_ID || ""}>
          <Avatar alt="Requester" src={data.Requester_Avatar || ""} />
        </Tooltip>
      );
    } else if (stepConfig.kind === "approver") {
      const f = getApproverFields(data, stepConfig.n, cancellerStep);
      avatarNode = (
        <Tooltip title={f.id || ""}>
          <Avatar alt={`Approver ${stepConfig.n}`} src={f.avatar || ""} />
        </Tooltip>
      );
    }

    return (
      <ColorlibStepIconRoot
        ownerState={{ completed, active }}
        className={className}
      >
        {avatarNode}
      </ColorlibStepIconRoot>
    );
  }

  ColorlibStepIcon.propTypes = {
    active: PropTypes.bool,
    className: PropTypes.string,
    completed: PropTypes.bool,
    icon: PropTypes.node,
  };

  // --------------------------- Нэг шатны Card ---------------------------
  const renderStepCard = (stepConfig) => {
    const isRequester = stepConfig.kind === "requester";
    const f = isRequester
      ? null
      : getApproverFields(data, stepConfig.n, cancellerStep);

    const status = isRequester ? data.Requester_Status : f.status;
    const major = isRequester ? data.Requester_Major : f.major;
    const comment = isRequester ? data.Requester_Comment : f.comment;
    const timeStamps = isRequester ? data.Requester_TimeStamps : f.timeStamps;

    // Өнгө: амжилттай = ногоон, цуцлагдсан = улаан, бусад = шар
    const bgColor = (theme) =>
      isSuccess(status)
        ? theme.palette.success.main
        : isCancel(status)
          ? theme.palette.error.main
          : theme.palette.warning.dark;

    return (
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
              backgroundColor: bgColor(theme),
              borderRadius: "0.25rem",
              color: "#fff",
              maxWidth: "14ch",
              p: "0.25rem",
            })}
          >
            {status || "—"}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {major || "—"}
          </Typography>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ marginTop: 1 }}
          >
            {timeStamps ? dayjs(timeStamps).format("YYYY/MM/DD HH:mm:ss") : "—"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {comment || "—"}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  // --------------------------- Render ---------------------------
  return (
    <Stack sx={{ width: "100%" }} spacing={4}>
      <Stepper
        alternativeLabel
        activeStep={activeStep}
        connector={<ColorlibConnector />}
      >
        {config.steps.map((stepConfig, idx) => (
          <Step key={`${config.key}-${idx}`}>
            <StepLabel StepIconComponent={ColorlibStepIcon}>
              {renderStepCard(stepConfig)}
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Stack>
  );
}

CustomizedSteppers.propTypes = {
  row: PropTypes.shape({
    original: PropTypes.object,
  }).isRequired,
};
