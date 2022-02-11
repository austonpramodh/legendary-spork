import {
    AppBar as MuiAppBar,
    Avatar,
    Box,
    Container,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Tooltip,
    Typography,
} from "@mui/material";
import React from "react";
import { useAuthContext } from "../../Contexts/Auth";

const AppBar = () => {
    const {
        values: { user },
        onLogout,
    } = useAuthContext();
    const [anchorElUser, setAnchorElUser] = React.useState<any>(null);

    const settings = [
        {
            label: "Logout",
            onClick: () => onLogout(),
        },
    ];

    const handleOpenUserMenu = (currentTarget: any) => {
        setAnchorElUser(currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <MuiAppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters>
                    <Typography variant="h6" noWrap component="div" sx={{ mr: 2, display: { md: "flex" } }}>
                        LOGO
                    </Typography>
                    <Box sx={{ flexGrow: 1, display: { md: "flex" } }}></Box>
                    {user && (
                        <Box sx={{ flexGrow: 0 }}>
                            <Tooltip title="Open settings">
                                <IconButton onClick={(e) => handleOpenUserMenu(e.currentTarget)} sx={{ p: 0 }}>
                                    <Avatar alt={user.getName()} src={user.getAvatar()} />
                                </IconButton>
                            </Tooltip>
                            <Menu
                                sx={{ mt: "45px" }}
                                id="menu-appbar"
                                anchorEl={anchorElUser}
                                anchorOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: "top",
                                    horizontal: "right",
                                }}
                                open={Boolean(anchorElUser)}
                                onClose={handleCloseUserMenu}
                            >
                                {settings.map(({ label, onClick }) => (
                                    <MenuItem
                                        key={label}
                                        onClick={() => {
                                            onClick();
                                            handleCloseUserMenu();
                                        }}
                                    >
                                        <Typography textAlign="center">{label}</Typography>
                                    </MenuItem>
                                ))}
                            </Menu>
                        </Box>
                    )}
                </Toolbar>
            </Container>
        </MuiAppBar>
    );
};

export default AppBar;
