import React from 'react'
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material'
import { db } from '../../firebase'
import { collection, doc, getDocs } from 'firebase/firestore'
import { useQuery } from '@tanstack/react-query'

export default () => {
  const ref = collection(db, 'character')
  const useCharacter = () => {
    return useQuery(['Character'], async () => {
      const res = await getDocs(ref)
      return res.docs.map(doc => doc.data())
    })
  }

  const { data, isLoading, error } = useCharacter()

  if (isLoading) return <div>Loading...</div>

  return (
    <Box>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>Character</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell sx={{ color: 'white' }}>{data?.[0].name}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Box>
  )
}
