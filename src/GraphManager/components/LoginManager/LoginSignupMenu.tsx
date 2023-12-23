import { Box, Button } from "@mui/material";
import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LoginForm from "./LoginForm";
import { SignUpForm } from "./SignUpForm";
import { useGraphDataContext } from "src/GraphDataContext";
import {
  LoginResponse,
  UserSignupInfo,
} from "src/GraphManager/hooks/useCreateUser";
import { UserLoginInfo } from "src/GraphManager/hooks/useLoginUser";
import { useUserDataContext } from "src/UserDataContext";

enum TabNames {
  "LOGIN",
  "SIGNUP",
}

interface FormTabProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

function FormTab(props: FormTabProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`form-tabpanel-${index}`}
      aria-labelledby={`form-tab-${index}`}
      {...other}
    >
      {value === index && <div>{children}</div>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `form-tab-${index}`,
    "aria-controls": `form-tabpanel-${index}`,
  };
}

export default function LoginSignupMenu() {
  const [open, setOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<TabNames>(TabNames.LOGIN);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectTab = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const { createUserWithEMail, loginUser } = useGraphDataContext();
  const { setUserID, setUserName, setAuthenticationToken } =
    useUserDataContext();
  const loginUserInContext = (login: LoginResponse | undefined) => {
    if (login?.success) {
      const username = login.userName ?? "unknown";
      setUserID(login.userID);
      setUserName(username);
      setAuthenticationToken(login.token);
      console.log(
        `setting login info in context: username=${username} id=${login.userID}, token=${login.token}`,
      );
    } else {
      console.log(`login failed: ${login}`);
    }
  };
  const handleLoginSubmit = async (userInput: UserLoginInfo) => {
    const rsp = await loginUser(userInput);
    loginUserInContext(rsp.data?.login);
  };
  const handleSignUpSubmit = async (signup: UserSignupInfo) => {
    const rsp = await createUserWithEMail(signup);
    loginUserInContext(rsp.data?.createUserWithEMail.login);
  };

  return (
    <Box>
      <Button variant="contained" color="primary" onClick={handleClickOpen}>
        Login/Signup
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <Box sx={{ width: "100%" }}>
          <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
            <Tabs value={selectedTab} onChange={handleSelectTab} centered>
              <Tab label="Login" {...a11yProps(0)}></Tab>
              <Tab label="Signup" {...a11yProps(0)}></Tab>
            </Tabs>
          </Box>
        </Box>
        <FormTab value={selectedTab} index={0}>
          <LoginForm onSubmit={handleLoginSubmit} />
        </FormTab>
        <FormTab value={selectedTab} index={1}>
          <SignUpForm onSubmit={handleSignUpSubmit} />
        </FormTab>
      </Dialog>
    </Box>
  );
}