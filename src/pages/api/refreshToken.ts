import axios from 'axios'
import { NextApiRequest, NextApiResponse } from 'next/types'


export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { headers } = req
  try {
    const config: any = {
      headers
    }
    const { data, headers: returnedHeaders } = await axios.post(
      'http://localhost:3001/auth/refresh', // refresh token Node.js server path
      undefined,
      config,
    )

    //  Update headers on requester using headers from Node.js server response
    Object.keys(returnedHeaders).forEach(key =>
      res.setHeader(key, returnedHeaders[key]),
    )

    res.status(200).json(data)
  } catch (error) {
    // we don't want to send status 401 here.
    res.send(error)
  }
}
