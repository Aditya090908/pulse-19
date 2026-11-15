
from datetime import datetime, timezone

import httpx

CDC_API_URL = "https://data.cdc.gov/resource/x9gk-5huc.json"

CDC_DATASET_URL = "https://data.cdc.gov/d/x9gk-5huc"

PAGE_SIZE = 5000

CDC_NOTES = {
    "-": "No cases reported",
    "U": "Unavailable",
    "N": "Not reportable",
    "NN": "Not nationally notifiable",
    "NP": "Not published",
    "NC": "Not calculated",
}


def parse_number(value):
    if value is None or value == "":
        return None

    try:
        return float(value)
    except (ValueError, TypeError):
        return None


def interpret_value(value, flag):
    # Preserve the original CDC flag.
    original_flag = str(flag).strip() if flag is not None else None

    if original_flag == "":
        original_flag = None

    return {
        "value": parse_number(value),
        "flag": original_flag,
        "flag_meaning": (
            CDC_NOTES.get(
                original_flag,
                "CDC status flag; consult source documentation"
            )
            if original_flag is not None
            else None
        ),
    }


async def fetch_latest_cdc_surveillance():

    async with httpx.AsyncClient(timeout=60.0) as client:

        # -----------------------------------------
        # 1. Discover the latest reporting period
        # -----------------------------------------

        latest_response = await client.get(
            CDC_API_URL,
            params={
                "$select": "year,week",
                "$order": "year DESC, week DESC",
                "$limit": 1,
            },
            headers={"Accept": "application/json"},
        )

        latest_response.raise_for_status()

        latest_rows = latest_response.json()

        if not latest_rows:
            raise ValueError(
                "CDC returned no available reporting periods"
            )

        latest = latest_rows[0]

        year = str(latest["year"])
        week = int(latest["week"])

        # -----------------------------------------
        # 2. Discover the total number of records
        # -----------------------------------------

        count_response = await client.get(
            CDC_API_URL,
            params={
                "$select": "count(*)",
                "$where": f"year = '{year}' AND week = {week}",
            },
            headers={"Accept": "application/json"},
        )

        count_response.raise_for_status()

        count_rows = count_response.json()

        if not count_rows:
            raise ValueError(
                "Unable to determine CDC record count"
            )

        expected_count = int(count_rows[0]["count"])

        # -----------------------------------------
        # 3. Fetch every record using pagination
        # -----------------------------------------

        rows = []
        offset = 0

        while offset < expected_count:

            response = await client.get(
                CDC_API_URL,
                params={
                    "$where": f"year = '{year}' AND week = {week}",
                    "$limit": PAGE_SIZE,
                    "$offset": offset,
                    "$order": "states ASC, label ASC",
                },
                headers={"Accept": "application/json"},
            )

            response.raise_for_status()

            batch = response.json()

            if not isinstance(batch, list):
                raise ValueError(
                    "Unexpected CDC response format"
                )

            if not batch:
                break

            rows.extend(batch)
            offset += len(batch)

            if len(batch) < PAGE_SIZE:
                break

        # -----------------------------------------
        # 4. Normalize CDC records
        # -----------------------------------------

        records = []

        for row in rows:

            records.append({
                "reporting_area": row.get("states"),

                "disease": row.get("label"),

                "mmwr_year": year,

                "mmwr_week": week,

                "current_week": interpret_value(
                    row.get("m1"),
                    row.get("m1_flag"),
                ),

                "previous_52_week_max": interpret_value(
                    row.get("m2"),
                    row.get("m2_flag"),
                ),

                "cumulative_ytd": interpret_value(
                    row.get("m3"),
                    row.get("m3_flag"),
                ),

                "previous_year_cumulative_ytd": interpret_value(
                    row.get("m4"),
                    row.get("m4_flag"),
                ),

                "source": "CDC NNDSS",

                "source_url": CDC_DATASET_URL,

                "data_status": "provisional",

                "simulated": False,
            })

        # -----------------------------------------
        # 5. Return normalized surveillance data
        # -----------------------------------------

        return {
            "source": "CDC NNDSS",

            "source_url": CDC_DATASET_URL,

            "dataset_id": "x9gk-5huc",

            "geographic_scope": (
                "United States and reporting jurisdictions"
            ),

            "reporting_year": year,

            "reporting_week": week,

            "expected_record_count": expected_count,

            "record_count": len(records),

            "pagination": {
                "page_size": PAGE_SIZE,
                "records_fetched": len(rows),
                "complete": len(rows) == expected_count,
            },

            "fetched_at": datetime.now(
                timezone.utc
            ).isoformat(),

            "data_status": "provisional",

            "simulated": False,

            "records": records,
        }
