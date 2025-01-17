import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  Grow,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Popper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DeleteOutlined, AddOutlined } from "@mui/icons-material";
import DataTransformerGeneratorWidget from "./DataTransformerGeneratorWidget";
import AppRunForm from "./AppRunForm";
import ProcessorRunForm from "./ProcessorRunForm";
import {
  sheetCellTypes,
  sheetFormulaTypes,
  SHEET_FORMULA_TYPE_DATA_TRANSFORMER,
  SHEET_FORMULA_TYPE_APP_RUN,
  SHEET_FORMULA_TYPE_PROCESSOR_RUN,
  SHEET_CELL_TYPE_TEXT,
  SHEET_FORMULA_TYPE_NONE,
} from "./Sheet";
import "@glideapps/glide-data-grid/dist/index.css";

const numberToLetters = (num) => {
  let letters = "";
  while (num >= 0) {
    letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[num % 26] + letters;
    num = Math.floor(num / 26) - 1;
  }
  return letters;
};

export function SheetColumnMenu({
  anchorEl,
  column,
  columns,
  addColumn,
  updateColumn,
  deleteColumn,
  open,
  setOpen,
}) {
  const [columnName, setColumnName] = useState(column?.title || "");
  const [cellType, setCellType] = useState(0);
  const [formulaType, setFormulaType] = useState(column?.formula?.type || "");
  const [formulaData, setFormulaData] = useState(column?.formula?.data || {});
  const [showFormulaTypeSelect, setShowFormulaTypeSelect] = useState(
    column?.formula?.type && column.formula.type !== SHEET_FORMULA_TYPE_NONE
      ? true
      : false,
  );
  const formulaDataRef = useRef(column?.formula?.data || {});

  useEffect(() => {
    setCellType(column?.cell_type || 0);
    setColumnName(column?.title || "");
    setFormulaType(column?.formula?.type || "");
    setFormulaData(column?.formula?.data || {});
    setShowFormulaTypeSelect(
      column?.formula?.type && column.formula.type !== SHEET_FORMULA_TYPE_NONE
        ? true
        : false,
    );
    formulaDataRef.current = column?.formula?.data || {};
  }, [column]);

  useEffect(() => {
    if (!open) {
      setColumnName("");
      setCellType(SHEET_CELL_TYPE_TEXT);
      setFormulaType("");
      setFormulaData({});
      formulaDataRef.current = {};
      setShowFormulaTypeSelect(false);
    } else {
      setShowFormulaTypeSelect(
        column?.formula?.type && column.formula.type !== SHEET_FORMULA_TYPE_NONE
          ? true
          : false,
      );
      setFormulaData(column?.formula?.data || {});
      setFormulaType(column?.formula?.type || "");
      formulaDataRef.current = column?.formula?.data || {};
    }
  }, [open, column]);

  const setDataHandler = useCallback(
    (data) => {
      formulaDataRef.current = {
        ...formulaDataRef.current,
        ...data,
      };
    },
    [formulaDataRef],
  );

  const memoizedProcessorRunForm = useMemo(
    () => (
      <ProcessorRunForm
        setData={setDataHandler}
        providerSlug={formulaData?.provider_slug}
        processorSlug={formulaData?.processor_slug}
        processorInput={formulaData?.input}
        processorConfig={formulaData?.config}
        processorOutputTemplate={formulaData?.output_template}
      />
    ),
    [formulaData, setDataHandler],
  );

  const memoizedAppRunForm = useMemo(
    () => (
      <AppRunForm
        setData={setDataHandler}
        appSlug={formulaData?.app_slug}
        appInput={formulaData?.input}
      />
    ),
    [formulaData, setDataHandler],
  );

  const handleAddOrEditColumn = () => {
    const newColumn = {
      col_letter: column ? column.col_letter : numberToLetters(columns.length),
      title: columnName || "",
      cell_type: cellType,
      width: column?.width || 300,
      formula: showFormulaTypeSelect
        ? {
            type:
              typeof formulaType === "string"
                ? parseInt(formulaType)
                : formulaType,
            data: formulaDataRef.current,
          }
        : null,
    };

    if (column) {
      updateColumn(newColumn);
    } else {
      addColumn(newColumn);
    }
    setOpen(false);
    setColumnName("");
    setCellType(SHEET_CELL_TYPE_TEXT);
    formulaDataRef.current = {};
    setFormulaType("");
    setFormulaData({});
    formulaDataRef.current = {};
  };

  const handleColumnDelete = () => {
    deleteColumn(column);
    setOpen(false);
    setColumnName("");
    setCellType(SHEET_CELL_TYPE_TEXT);
    setFormulaType("");
    setFormulaData({});
    formulaDataRef.current = {};
  };

  return (
    open && (
      <Popper
        open={open}
        anchorEl={anchorEl}
        role={undefined}
        placement="bottom-start"
        transition
        sx={{
          width: "450px",
          maxHeight: "80vh",
          overflowY: "auto",
          padding: "0px 2px 8px 2px",
        }}
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom-start" ? "left top" : "left bottom",
            }}
          >
            <Paper>
              <Stack gap={2} sx={{ padding: 2 }}>
                <Stack
                  direction="row"
                  gap={2}
                  sx={{ justifyContent: "flex-end" }}
                >
                  {column && (
                    <IconButton
                      variant="outlined"
                      onClick={handleColumnDelete}
                      sx={{
                        color: "text.secondary",
                        minWidth: "30px",
                        padding: 0,
                      }}
                    >
                      <DeleteOutlined />
                    </IconButton>
                  )}
                </Stack>
                <TextField
                  label="Name"
                  value={columnName}
                  placeholder="Column Name"
                  variant="outlined"
                  onChange={(e) => setColumnName(e.target.value)}
                />
                <Select
                  value={cellType}
                  id="column-type-select"
                  aria-label="Cell Type"
                  placeholder="Cell Type"
                  onChange={(e) => setCellType(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                >
                  {Object.keys(sheetCellTypes).map((type) => (
                    <MenuItem key={type} value={type}>
                      <Stack spacing={0}>
                        <Typography variant="body1">
                          {sheetCellTypes[type].label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sheetCellTypes[type].description}
                        </Typography>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    paddingTop: 2,
                    paddingBottom: 2,
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setShowFormulaTypeSelect(!showFormulaTypeSelect)
                  }
                >
                  <Checkbox
                    checked={showFormulaTypeSelect}
                    onChange={(e) => setShowFormulaTypeSelect(e.target.checked)}
                    inputProps={{ "aria-label": "Add dynamic data" }}
                    sx={{
                      paddingLeft: 0,
                      marginLeft: 0,
                    }}
                  />
                  <Typography variant="body2">
                    Populate column with a formula
                  </Typography>
                </Box>
                {showFormulaTypeSelect && (
                  <FormControl>
                    <InputLabel id="formula-type-select-label">
                      Formula Type
                    </InputLabel>
                    <Select
                      value={formulaType.toString()}
                      id="formula-type-select"
                      aria-label="Formula Type"
                      onChange={(e) => {
                        setFormulaType(parseInt(e.target.value));
                        formulaDataRef.current = {};
                      }}
                      onClick={(e) => e.stopPropagation()}
                      variant="filled"
                      label="Formula Type"
                    >
                      {Object.keys(sheetFormulaTypes).map((type) => (
                        <MenuItem key={type} value={type.toString()}>
                          <Stack spacing={0}>
                            <Typography variant="body1">
                              {sheetFormulaTypes[type].label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {sheetFormulaTypes[type].description}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
                {showFormulaTypeSelect && formulaType && (
                  <Typography variant="caption" color="text.secondary">
                    You can access the value of a cell in the current row using{" "}
                    <code>{"{{A}}"}</code>, where A is the column letter.
                    <br />
                    &nbsp;
                  </Typography>
                )}
                {showFormulaTypeSelect &&
                  formulaType === SHEET_FORMULA_TYPE_DATA_TRANSFORMER && (
                    <DataTransformerGeneratorWidget
                      label="Transformation Template"
                      value={formulaData?.transformation_template}
                      onChange={(value) => {
                        setFormulaData({
                          transformation_template: value,
                        });
                        formulaDataRef.current = {
                          ...formulaDataRef.current,
                          transformation_template: value,
                        };
                      }}
                      multiline
                      rows={4}
                      placeholder="Enter LiquidJS template"
                      helpText={
                        "Use LiquidJS syntax to transform data from other columns in this row. Example: {{ A | upcase }}. The 'A' variable contains the value of the A column in this row."
                      }
                    />
                  )}
                {showFormulaTypeSelect &&
                  formulaType === SHEET_FORMULA_TYPE_APP_RUN &&
                  memoizedAppRunForm}
                {showFormulaTypeSelect &&
                  formulaType === SHEET_FORMULA_TYPE_PROCESSOR_RUN &&
                  memoizedProcessorRunForm}
                {showFormulaTypeSelect && (
                  <TextField
                    type="number"
                    label="Max Parallel Runs"
                    value={formulaData.max_parallel_runs || 1}
                    onChange={(e) => {
                      const value = Math.max(
                        4,
                        parseInt(e.target.value, 10) || 4,
                      );
                      setFormulaData((prevData) => ({
                        ...prevData,
                        max_parallel_runs: value,
                      }));
                      formulaDataRef.current = {
                        ...formulaDataRef.current,
                        max_parallel_runs: value,
                      };
                    }}
                    InputProps={{ inputProps: { min: 1, max: 4 } }}
                    fullWidth
                    helperText="Max number of parallel row runs of this formula"
                    variant="standard"
                    margin="normal"
                  />
                )}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{ width: "100%", justifyContent: "center", mt: 2 }}
                >
                  <Button
                    sx={{ textTransform: "none" }}
                    variant="standard"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={handleAddOrEditColumn}>
                    {column ? "Update" : "Add"}
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grow>
        )}
      </Popper>
    )
  );
}

export function SheetColumnMenuButton({ columns, addColumn }) {
  const anchorRef = useRef(null);
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <IconButton
        aria-label="add-column"
        ref={anchorRef}
        aria-controls={open ? "composition-menu" : undefined}
        aria-expanded={open ? "true" : undefined}
        aria-haspopup="true"
        onClick={() => setOpen(!open)}
      >
        <AddOutlined />
      </IconButton>
      <SheetColumnMenu
        columns={columns}
        addColumn={addColumn}
        open={open}
        setOpen={setOpen}
        anchorEl={anchorRef.current}
      />
    </Box>
  );
}
