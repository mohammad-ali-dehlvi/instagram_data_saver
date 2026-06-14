import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import AccountCircle from "@mui/icons-material/AccountCircle";
import {
  shouldShowStorageStateSelect,
  storageStateOptions,
  useStorageStateContext,
} from "../context/StorageState";

function getStorageStateLabel(value: string) {
  const fileName = value.split(/[\\/]/).pop() ?? value;
  return fileName.replace(/\.json$/i, "");
}

export default function StorageStateSelect() {
  const { selectedStorageState, setSelectedStorageState } =
    useStorageStateContext();

  if (!shouldShowStorageStateSelect) return null;

  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
      <InputLabel id="storage-state-select-label">Storage State</InputLabel>
      <Select
        labelId="storage-state-select-label"
        value={selectedStorageState}
        label="Storage State"
        onChange={(event) => setSelectedStorageState(event.target.value)}
        sx={{
          bgcolor: "background.paper",
          "& .MuiSelect-select": {
            display: "flex",
            alignItems: "center",
            gap: 1,
            fontFamily: "inherit",
            fontSize: "0.82rem",
          },
        }}
        renderValue={(value) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <AccountCircle sx={{ fontSize: 17, color: "text.disabled" }} />
            <Typography
              component="span"
              sx={{ fontFamily: "inherit", fontSize: "0.82rem" }}
            >
              {getStorageStateLabel(value)}
            </Typography>
          </Box>
        )}
      >
        {storageStateOptions.map((storageState) => (
          <MenuItem key={storageState} value={storageState}>
            {getStorageStateLabel(storageState)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
