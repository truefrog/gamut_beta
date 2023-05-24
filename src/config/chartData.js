import { useMemo } from 'react'
import { useQuery } from '@apollo/client'
import gql from 'graphql-tag'
import {
  kavaClient,
} from '../apollo/client'

export const SWAP_TRANSACTIONS = gql`
  query swapTransactions($address: Bytes!) {
    swaps(last:1000, orderBy: timestamp, orderDirection: desc, where: { sender: $address }, subgraphError: allow) {
      id
      timestamp
      sender
      amount0
      amount1
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
      transaction {
        id
      }
    }
  }
`

export const JOIN_TRANSACTIONS = gql`
  query joinTransactions($address: Bytes!) {
    joins(last:1000, orderBy: timestamp, orderDirection: desc, where: { sender: $address }, subgraphError: allow) {
      id
      timestamp
      sender
      amountsIn
      token0 {
        symbol
        decimals
      }
      token1 {
        symbol
        decimals
      }
      transaction {
        id
      }
    }
  }
`

export const EXIT_TRANSACTIONS = gql`
  query exitTransactions($address: Bytes!) {
    exits(last:1000, orderBy: timestamp, orderDirection: desc, where: { sender: $address }, subgraphError: allow) {
      id
      timestamp
      sender
      amountUSD
      liquidity
      amountsOut
      token0 {
        symbol
        decimals
      }
      token1 {
        symbol
        decimals
      }
      transaction {
        id
      }
    }
  }
`

export const POOL_WEIGHTS = gql`
  query poolWeights($address: Bytes!) {
    weightBalanceDatas(first:1000, orderBy: timestamp, orderDirection: asc, where: { pool: $address }, subgraphError: allow) {
      id
      timestamp
      weight0
      weight1
      token0 {
        symbol
      }
      token1 {
        symbol
      }
    }
  }
`

export const POOL_PRICES = (poolString) => {
  return gql`
  query poolTokenPrices {
    poolTokensPrices(first:1000, orderBy: timestamp, orderDirection: asc, where: { pool_in: ${poolString} }, subgraphError: allow) {
      id
      timestamp
      token0Price
      token1Price
      pool {
        id
      }
      token0 {
        id
        symbol
      }
      token1 {
        id
        symbol
      }
    }
  }
`
}

/**
 * Fetch swap transactions
 */
 export function useSwapTransactionsData(address) {
  const { loading, error, data } = useQuery(SWAP_TRANSACTIONS, {
    client: kavaClient,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  });
  const formattedData = useMemo(() => {
    if (data) {
      return data.swaps
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    swaps: formattedData,
  }
}

/**
 * Fetch add liquidity transactions
 */
 export function useJoinTransactionsData(address) {
  const { loading, error, data } = useQuery(JOIN_TRANSACTIONS, {
    client: kavaClient,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  });
  
  const formattedData = useMemo(() => {
    if (data) {
      return data.joins
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    joins: formattedData,
  }
}

/**
 * Fetch remove liquidity transactions
 */
 export function useExitTransactionsData(address) {
  const { loading, error, data } = useQuery(EXIT_TRANSACTIONS, {
    client: kavaClient,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
    pollInterval: 20000,
  });
  const formattedData = useMemo(() => {
    if (data) {
      return data.exits
    } else {
      return undefined
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    exits: formattedData,
  }
}

/**
 * Fetch weights
 */
export function useWeightsData(address) {
  const { loading, error, data } = useQuery(POOL_WEIGHTS, {
    client: kavaClient,
    variables: {
      address: address,
    },
    fetchPolicy: 'cache-first',
  })
  const formattedData = useMemo(() => {
    if (data) {
      return data.weightBalanceDatas
    } else {
      return undefined
    }
  }, [data])

  return {
    loading: loading,
    error: Boolean(error),
    weights: formattedData,
  }
}

/**
 * Fetch tokenPrices
 */
export function useTokenPricesData(addresses) {
  let poolString = `[`
  addresses.map((address) => {
    return (poolString += `"${address}",`)
  })
  poolString += ']'
  const { loading, error, data } = useQuery(POOL_PRICES(poolString), {
    client: kavaClient,
    variables: {},
    fetchPolicy: 'cache-first',
  })
  const formattedData = useMemo(() => {
    if (data) {
      return data.poolTokensPrices
    } else {
      return undefined
    }
  }, [data])
  return {
    loading: loading,
    error: Boolean(error),
    prices: formattedData,
  }
}
