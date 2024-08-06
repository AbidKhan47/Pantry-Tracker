'use client'
import { Box, Stack, Typography, Button, Modal, TextField, InputAdornment } from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import { firestore } from '@/firebase'
import { collection, setDoc, doc, query, getDoc, getDocs, deleteDoc } from 'firebase/firestore'
import { useEffect, useState } from 'react'

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'white',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  display: 'flex',
  flexDirection: 'column',
  gap: 3,
};

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [newName, setNewName] = useState('');

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, 'pantry'));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ "name": doc.id, ...doc.data() });
    });
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const addItem = async (item) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), normalizedItem);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      await setDoc(docRef, { count: count + 1 });
    } else {
      await setDoc(docRef, { count: 1 });
    }
    await updatePantry();
  };

  const adjustItemCount = async (item, adjustment) => {
    const normalizedItem = item.toLowerCase();
    const docRef = doc(collection(firestore, 'pantry'), normalizedItem);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const { count } = docSnap.data();
      const newCount = count + adjustment;
      if (newCount <= 0) {
        await deleteDoc(docRef);
      } else {
        await setDoc(docRef, { count: newCount });
      }
    }
    await updatePantry();
  };

  const updateItemName = async (oldName, newName) => {
    const normalizedOldName = oldName.toLowerCase();
    const normalizedNewName = newName.toLowerCase();

    if (normalizedOldName !== normalizedNewName) {
      const oldDocRef = doc(collection(firestore, 'pantry'), normalizedOldName);
      const newDocRef = doc(collection(firestore, 'pantry'), normalizedNewName);

      const oldDocSnap = await getDoc(oldDocRef);
      if (oldDocSnap.exists()) {
        const oldData = oldDocSnap.data();
        const newDocSnap = await getDoc(newDocRef);

        if (newDocSnap.exists()) {
          const newData = newDocSnap.data();
          await setDoc(newDocRef, {
            count: (newData.count || 0) + (oldData.count || 0)
          });
        } else {
          await setDoc(newDocRef, oldData);
        }
        await deleteDoc(oldDocRef);
      }
      await updatePantry();
    }
    setEditingItem(null);
  };

  const filteredPantry = pantry.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box
      width="100vw"
      height="100vh"
      display={'flex'}
      justifyContent={'center'}
      flexDirection={'column'}
      alignItems={'center'}
      gap={2}
    >
      <Typography variant={'h1'} color={'000000'} textAlign={'center'} fontFamily={"Times New Roman"} fontWeight={'bold'}>
        Pantry Tracker:
      </Typography>

      <hr style={{ border: '6px solid #000', margin: '3px 0', width: "70%" }} />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <TextField
          label="Search Items"
          variant="outlined"
          sx={{ maxWidth: 600 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
        <Button variant="outlined" onClick={handleOpen}>Add</Button>
      </Stack>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2" fontFamily={"Times New Roman"} fontWeight={'bold'}>
            Add Item
          </Typography>
          <Stack width="100%" direction={'row'} spacing={2}>
            <TextField
              id="outlined-basic"
              label="Item"
              variant="outlined"
              fullWidth
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
            />
            <Button
              variant="outlined"
              onClick={() => {
                addItem(itemName);
                setItemName('');
                handleClose();
              }}
            >
              Add
            </Button>
          </Stack>
        </Box>
      </Modal>

      <Box border={'1px solid #333'}>
        <Box
          width="800px"
          height="100px"
          bgcolor={'#ffffff'}
          display={'flex'}
          justifyContent={'center'}
          alignItems={'center'}
        >
          <Typography variant={'h2'} color={'000000'} textAlign={'center'} fontFamily={"Times New Roman"} fontWeight={'bold'}>
            Items:
          </Typography>
        </Box>
        <Stack width="800px" height="300px" spacing={2} overflow={'auto'}>
          {filteredPantry.map(({ name, count }) => (
            <Box
              key={name}
              minHeight="150px"
              display={'flex'}
              justifyContent={'space-between'}
              paddingX={3}
              alignItems={'center'}
              bgcolor={'#f0f0f0'}
            >
              <Typography variant={'h3'} color={'000000'} textAlign={'center'} fontFamily={"Times New Roman"} fontWeight={'bold'}>
                {count}
              </Typography>

              {editingItem === name ? (
                <TextField
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onBlur={() => updateItemName(name, newName)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      updateItemName(name, newName);
                    }
                  }}
                  autoFocus
                />
              ) : (
                <Typography
                  variant={'h3'}
                  color={'000000'}
                  textAlign={'center'}
                  fontWeight={'bold'}
                  fontFamily={'Times New Roman'}
                  onDoubleClick={() => {
                    setEditingItem(name);
                    setNewName(name);
                  }}
                >
                  {name.charAt(0).toUpperCase() + name.slice(1)}
                </Typography>
              )}

              <Stack direction="row" spacing={1} alignItems="center">
                <Button variant="outlined" onClick={() => adjustItemCount(name, 1)}>+</Button>
                <Button variant="outlined" onClick={() => adjustItemCount(name, -1)}>-</Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
