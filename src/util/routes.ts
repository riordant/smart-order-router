import { Percent } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import _ from 'lodash';
import { CurrencyAmount } from '.';
import { IRouteWithValidQuote } from '../routers/alpha-router';
import { V2Route, V3Route } from '../routers/router';

export const routeToString = (route: V3Route | V2Route): string => {
  const isV3Route = (route: V3Route | V2Route): route is V3Route => (route as V3Route).pools != undefined;
  const routeStr = [];
  const tokens = isV3Route(route) ? route.tokenPath : route.path;
  const tokenPath = _.map(tokens, (token) => `${token.symbol}`);
  const pools = isV3Route(route) ? route.pools : route.pairs;
  const poolFeePath = _.map(
    pools,
    (pool) => ` -- ${pool instanceof Pool ? pool.fee / 10000 : ''}% --> `
  );

  for (let i = 0; i < tokenPath.length; i++) {
    routeStr.push(tokenPath[i]);
    if (i < poolFeePath.length) {
      routeStr.push(poolFeePath[i]);
    }
  }

  return routeStr.join('');
};

export const routeAmountsToString = (routeAmounts: IRouteWithValidQuote[]): string => {
  const total = _.reduce(
    routeAmounts,
    (total: CurrencyAmount, cur: IRouteWithValidQuote) => {
      return total.add(cur.amount);
    },
    CurrencyAmount.fromRawAmount(routeAmounts[0]!.amount.currency, 0)
  );

  const routeStrings = _.map(routeAmounts, ({ route, amount }) => {
    const portion = amount.divide(total);
    const percent = new Percent(portion.numerator, portion.denominator);
    return `${percent.toFixed(2)}% = ${routeToString(route)}`;
  });

  return _.join(routeStrings, ', ');
};

export const routeAmountToString = (routeAmount: IRouteWithValidQuote): string => {
  const { route, amount } = routeAmount;
  return `${amount.toExact()} = ${routeToString(route)}`;
};

export const poolToString = (p: Pool): string => {
  return `${p.token0.symbol}/${p.token1.symbol}/${p.fee / 10000}%`;
};
