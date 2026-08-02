import { TableCell, TableRow, Typography } from '@mui/material';
import { AlnjoomLoader } from './alnjoom-loader';

interface TableLoadingRowProps {
  colSpan: number;
}

interface EmptyTableStateProps {
  colSpan: number;
  message: string;
}

export function TableLoadingRow({ colSpan }: TableLoadingRowProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
        <AlnjoomLoader size="sm" label="جاري تحميل البيانات..." compact />
      </TableCell>
    </TableRow>
  );
}

export function EmptyTableState({ colSpan, message }: EmptyTableStateProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 6 }}>
        <Typography color="text.secondary">{message}</Typography>
      </TableCell>
    </TableRow>
  );
}
