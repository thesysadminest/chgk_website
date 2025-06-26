import API_BASE_URL from '../config';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import { getAccessToken, getUserData } from "../utils/AuthUtils";
import { Box, Typography, Link as MuiLink, Stack, Button, Paper, TextField, CircularProgress, Alert } from "@mui/material";
import { Edit, Delete, DeleteForever, Done, Close, Face, Event } from "@mui/icons-material";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const PackDetail = () => {
  const theme = useTheme();
  const [rows, setRows] = useState([]);
  const navigate = useNavigate();
  const [visited, setVisited] = useState({});
  const [pack, setPack] = useState({
    id: useParams().id,
    name: "",
    author_p: "",
    author_id: "",
    pub_date_p: "",
    questions: [],
  });
  const [authorsCache, setAuthorsCache] = useState({});

  const myName = getUserData()?.username || null;
  const [isMyPack, setIsMyPack] = useState(false);

  const getAuthorUsername = async (authorId) => {
    if (!authorId) return "Неизвестно";
    
    if (authorsCache[authorId]) return authorsCache[authorId];
    
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/${authorId}/`);
      const username = response.data.username;
      setAuthorsCache(prev => ({ ...prev, [authorId]: username }));
      return username;
    } catch (error) {
      console.error("Ошибка при получении данных автора:", error);
      return `Автор ID: ${authorId}`;
    }
  };

  useEffect(() => {
    //if (!pack.id) return;
    const fetchPackData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/pack/${pack.id}/`);
        console.log("Raw response data:", response.data);
        
        const packData = response.data;
        setPack({
          id: packData.id || "",
          name: packData.name || "No name",
          description: packData.description || "",
          author_p: packData.author_p?.username || "Unknown",
          author_id: packData.author_p?.id || "Unknown",
          pub_date_p: packData.pub_date_p || "Unknown",
          questions: packData.questions || []
        });

        setIsMyPack(packData.author_p?.username === myName);
        
        setRows(packData.questions?.map((q, i) => ({
          id: q.id,
          questionIndex: i + 1,
          question_text: q.question_text,
          author_q: q.author_q?.username || "Unknown",
          pub_date_q: q.pub_date_q ? new Date(q.pub_date_q).toLocaleDateString("ru-RU") : "Unknown"
        })) || []);

      } catch (error) {
        console.error("Error fetching pack:", error);
      }
    };
    fetchPackData();
  }, [pack.id, myName]);

  const handleRowClick = (params) => {
    navigate(`/question/${params.row.id}`);
    setVisited(prev => ({ ...prev, [params.row.id]: true }));
  };

  const [packNameEdit, setPackNameEdit] = useState("");
  const [packDescrEdit, setPackDescrEdit] = useState("");

  const [buttonsPending, setButtonsPending] = useState(false);
  const [buttonsEdit, setButtonsEdit] = useState(false);
  const [buttonsDelete, setButtonsDelete] = useState(false);

  const [goodState, setGoodState] = useState("");
  const [errState, setErrState] = useState("");
  const [deletedState, setDeletedState] = useState(false);

  const editIsValid = packNameEdit.trim() && packDescrEdit.trim();

  const handleEditButton = () => {
    setPackNameEdit(pack.name);
    setPackDescrEdit(pack.description);
    setButtonsEdit(true);
  };

  const handleDeleteButton = () => {
    setButtonsDelete(true);
  };

  const handleCloseButton = () => {
    if (buttonsPending) return;
    setButtonsEdit(false);
    setButtonsDelete(false);
  };

  const handleEditPack = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const packResponse = await axios.put(
        `${API_BASE_URL}/api/pack/update/${pack.id}/`,
        {
          name: packNameEdit.trim(),
          description: packDescrEdit.trim()
        },
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (packResponse.status !== 200) {
        throw new Error("Ошибка при редактировании пакета");
      }

      pack.name = packNameEdit.trim();
      pack.description = packDescrEdit.trim();
      setGoodState("Информация обновлена!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при редактировании пакета")
    } finally {
      setButtonsPending(false);
      handleCloseButton();
    }
  };

  const handleDeletePack = async () => {
    if (buttonsPending) return;
    setButtonsPending(true);

    try {
      const token = getAccessToken();
      if (!token) throw new Error("Токен доступа не найден");
      const packResponse = await axios.delete(
        `${API_BASE_URL}/api/pack/delete/${pack.id}/`,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (packResponse.status !== 204) {
        throw new Error("Ошибка при удалении пакета");
      }

      setPack({
        id: pack.id,
      });
      console.log(pack);
      setRows([]);
      setDeletedState(true);
      setGoodState("Пакет удалён!");
    }
    catch (error) {
      console.error("Ошибка:", error);
      setErrState(error.response?.data?.message || error.message || "Ошибка при удалении пакета")
    } finally {
      setButtonsPending(false);
      handleCloseButton();
    }
  };


  return (
    <Box sx={{ height: '100%', display: "flex", justifyContent: "space-between", flexDirection: 'column', mb: 2 }}>
      {errState.trim() &&
       <Alert severity="error" sx={{ mb: 3 }}>
         {errState}
       </Alert>
      }
      {goodState.trim() &&
       <Alert severity="success" sx={{ mb: 3 }}>
         {goodState}
       </Alert>
      }
      {deletedState &&
       <Button variant="outlined-grey" component={Link} to={`/packs`}>
         Назад к пакам
       </Button>
      }
      
      {!deletedState && (
        <>
          <Stack 
            direction="row" 
            sx={{ 
              justifyContent: "space-between", 
              alignItems: "center", 
              mb: 2,
              flexWrap: 'wrap-reverse',
              gap: 2
            }}
          >
            <Box>
              {!(buttonsEdit) && (
                <>
                  <Box display="flex" flexDirection="row" alignItems="center" sx={{flexWrap: 'revert'}}>
                    <Typography variant="h4" sx={{mr: 4}}>
                      {pack.name}
                    </Typography>
                    <Paper variant_p="chip">
                      <Face/>
                      <MuiLink component={Link} to={`/user/${pack.author_id}`} color="inherit" sx={{ ml: "4px" }}>
                        {pack.author_p}
                      </MuiLink>

                      <Event sx={{ ml: 2 }}/>
                      <Typography sx={{ ml: "4px" }}>
                        {pack.pub_date_p !== "Неизвестно" 
                         ? new Date(pack.pub_date_p).toLocaleDateString("ru-RU") 
                         : "----"}
                      </Typography>
                    </Paper>
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {pack.description}
                  </Typography>
                </>
              )}
              {buttonsEdit && (
                <>
                  <TextField
                    label="Название пакета *"
                    variant_tf="dark"
                    fullWidth
                    disabled={buttonsPending}
                    defaultValue={pack.name}
                    onChange={(e) => setPackNameEdit(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    label="Описание пакета *"
                    variant_tf="dark"
                    fullWidth
                    disabled={buttonsPending}
                    defaultValue={pack.description}
                    onChange={(e) => setPackDescrEdit(e.target.value)}
                    sx={{ mb: 2 }}
                  />
                </>
              )}
            </Box>

            {isMyPack && (
              <>
                <Stack spacing={2} direction="row" >
                  {!(buttonsEdit || buttonsDelete) && (
                    <>
                      <Button onClick={handleEditButton} variant="outlined-grey"> 
                        <Edit />
                      </Button>
                      <Button onClick={handleDeleteButton} variant="outlined-grey">
                        <Delete />
                      </Button>
                    </>
                  )}
                {(buttonsEdit) && (
                  <>
                    <Button
                      variant={editIsValid ? "outlined-grey" : "disabled-dark"}
                      disabled={!editIsValid}
                      onClick={handleEditPack}>
                      {buttonsPending ? <CircularProgress size={24} color="inherit"/> : <Done /> }
                    </Button>
                    <Button variant="outlined-grey" onClick={handleCloseButton}>
                      <Close />
                    </Button>
                  </>
                )}
                {(buttonsDelete) && (
                  <>
                    <Button variant="red" onClick={handleDeletePack}>
                      {buttonsPending ? <CircularProgress color="inherit"/> : <DeleteForever /> }
                    </Button>
                    <Button variant="outlined-grey" onClick={handleCloseButton}>
                      <Close />
                    </Button>
                  </>
                )}
              </Stack>
              </>
            )}
        </Stack>
        <Typography variant="h6" gutterBottom>
          Вопросы:
        </Typography>

        <DataGrid
          rows={rows}
          columns={[
            { field: "questionIndex", headerName: "№", flex: 0.5 },
            { field: "question_text", headerName: "Текст вопроса", flex: 3 },
            { field: "author_q", headerName: "Автор", flex: 1 },
            { field: "pub_date_q", headerName: "Дата создания", flex: 1 },
          ]}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          autoHeight
          getRowId={(row) => row.id}
          disableSelectionOnClick
          onRowClick={handleRowClick}
        />
        </>
      )}

    </Box>
  );
};

export default PackDetail;
