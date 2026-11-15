
import re
from html import unescape

import httpx

WHO_API_URL = "https://www.who.int/api/hubs/diseaseoutbreaknews"


def clean_html(value: str | None) -> str:
    if not value:
        return ""

    value = re.sub(
        r"<(script|style)[^>]*>.*?</\1>",
        " ",
        value,
        flags=re.IGNORECASE | re.DOTALL,
    )
    value = re.sub(r"<[^>]+>", " ", value)
    value = unescape(value)

    return re.sub(r"\s+", " ", value).strip()


async def fetch_who_outbreaks(limit: int = 20) -> list[dict]:
    params = {
        "$orderby": "PublicationDate desc",
        "$top": limit,
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.get(
            WHO_API_URL,
            params=params,
            headers={"Accept": "application/json"},
        )
        response.raise_for_status()
        payload = response.json()

    records = payload.get("value")

    if not isinstance(records, list):
        raise ValueError("Unexpected WHO API response format")

    reports = []

    for item in records:
        report_id = item.get("DonId") or item.get("Id")
        source_url = item.get("ItemDefaultUrl")

        reports.append({
            "id": str(report_id or ""),
            "title": item.get("Title") or "Untitled report",
            "publication_date": item.get("PublicationDate"),
            "last_modified": item.get("LastModified"),
            "summary": clean_html(item.get("Summary")),
            "overview": clean_html(item.get("Overview")),
            "epidemiology": clean_html(item.get("Epidemiology")),
            "assessment": clean_html(item.get("Assessment")),
            "advice": clean_html(item.get("Advice")),
            "source": "World Health Organization",
            "source_url": source_url,
            "data_type": "official_outbreak_report",
            "simulated": False,
        })

    return reports
