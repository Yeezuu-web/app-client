import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { headers } = req
  try {
    const config: any = {
      headers
    }
    const response = await axios.get('http://localhost:3001/users', config)

    res.status(200).json(response.data)
  } catch ({ response: { status, data } }) {
    res.status(status as number).json(data)
  }
}
