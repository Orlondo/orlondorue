import React from 'react'
import { db } from '../../firebase'
import { collection, getDocs } from 'firebase/firestore'
import { useQuery } from '@tanstack/react-query'

export default function Collection() {
  const { data } = useQuery({
    queryKey: ['Character'],
    queryFn: async () => {
      const res = await getDocs(collection(db, 'character'))
      return res.docs.map(doc => doc.data())
    },
  })

  return (
    <table>
      <thead>
        <tr>
          <th style={{ color: 'white' }}>Character</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style={{ color: 'white' }}>{data?.[0]?.name}</td>
        </tr>
      </tbody>
    </table>
  )
}
