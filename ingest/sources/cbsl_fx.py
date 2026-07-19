"""CBSL daily indicative USD/LKR buy & sell rates."""

from __future__ import annotations

from datetime import date, timedelta

from bs4 import BeautifulSoup

from ..base import Observation, Source

RESULTS_URL = (
    "https://www.cbsl.gov.lk/cbsl_custom/exratestt/exrates_resultstt.php"
)


class CbslFx(Source):
    id = "cbsl_fx"
    expected_cadence_minutes = 1440

    def fetch(self) -> str:
        today = date.today()
        res = self.http_post(
            RESULTS_URL,
            data={
                "lookupPage": "lookup_daily_exchange_rates.php",
                "startRange": "2006-11-11",
                "rangeType": "dates",
                "txtStart": (today - timedelta(days=7)).isoformat(),
                "txtEnd": today.isoformat(),
                "chk_cur[]": "USD~US Dollar",
                "submit_button": "Submit",
            },
        )
        return res.text

    def normalise(self, raw: str) -> list[Observation]:
        soup = BeautifulSoup(raw, "html.parser")
        table = soup.find("table")
        if table is None:
            raise ValueError("no rates table in CBSL response")

        observations: list[Observation] = []
        for row in table.find_all("tr"):
            cells = [c.get_text(strip=True) for c in row.find_all("td")]
            if len(cells) != 3:
                continue
            day, buy, sell = cells
            observed_at = f"{day}T06:30:00+00:00"
            observations.append(
                Observation("usd_lkr_buy", float(buy), observed_at, unit="LKR")
            )
            observations.append(
                Observation("usd_lkr_sell", float(sell), observed_at, unit="LKR")
            )

        if not observations:
            raise ValueError("CBSL table parsed but contained no rate rows")
        return observations
