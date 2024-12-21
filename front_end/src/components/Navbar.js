import React from "react";
import { 
    Divider, 
    ListItemIcon, 
    ListItemText, 
    MenuItem, 
    MenuList, 
    Paper, 
    Typography, 
    Link,
    Card
} from "@mui/material";

const Navbar = () => {
    return ( 
        <left> 
            <div> 
                <h1 style={{ color: "green" }}>ЧГК </h1> 
                <h2 sx={{width:100, m:5}}>Навигация по сайту</h2> 
            </div> 
            <div> 
                <Card sx={{ width: 500, maxWidth: "100%" , m:5}}> 
                    <MenuList> 
                        <MenuItem component={Link} href='/packs'>Пакеты</MenuItem>
                        <MenuItem component={Link} href='/qs'>Вопросы</MenuItem>
                        <MenuItem component={Link} href='/users'>Пользователи</MenuItem>
                    </MenuList> 
                </Card> 
            </div> 
        </left> 
    ); 
} 

export default Navbar;  