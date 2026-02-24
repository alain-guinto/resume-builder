"""Resume model — data loading, saving, and default values."""
import json
from pathlib import Path

from flask import current_app


class ResumeModel:
    """Handles persistence and default data for resume records."""

    @staticmethod
    def _data_file() -> Path:
        return current_app.config["DATA_FILE"]

    @classmethod
    def load(cls) -> dict:
        """Return saved resume data, or defaults if no file exists."""
        data_file = cls._data_file()
        if data_file.exists():
            with open(data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        return cls.default_data()

    @classmethod
    def save(cls, data: dict) -> None:
        """Persist resume data to disk."""
        data_file = cls._data_file()
        data_file.parent.mkdir(parents=True, exist_ok=True)
        with open(data_file, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    @staticmethod
    def default_data() -> dict:
        """Seed data used when no saved resume exists."""
        return {
            "contacts": {
                "firstName": "Alain",
                "lastName": "Guinto",
                "name": "Alain Guinto",
                "jobTitle": "Solutions Architect",
                "email": "alain.guinto@yahoo.com",
                "phone": "",
                "phoneCode": "+63",
                "country": "Philippines",
                "city": "Mandaluyong",
                "location": "Mandaluyong, Philippines",
                "address": "",
                "postCode": "",
                "linkedin": "https://www.linkedin.com/in/alainguinto",
                "website": "",
                "additional": "",
            },
            "summary": (
                "Solutions Architect at GCash with 17+ years in IT, passionate about "
                "designing scalable, resilient, and business-driven systems that turn "
                "complex problems into elegant solutions. Started as a developer and "
                "evolved through roles as database administrator, ETL developer, data & "
                "analytics developer, and data engineer. Focus on bridging strategy with "
                "execution, collaboration, and clear communication. Experience spans "
                "Financial Services, Telecommunications, BPO, Logistics, and FinTech. "
                "Driven by curiosity, problem-solving, and the belief that the right "
                "architecture unlocks innovation at scale."
            ),
            "experience": [
                {
                    "dates": "Aug 2024",
                    "role": "Solutions Architect",
                    "company": "GCash",
                    "description": "Designing scalable, resilient, and business-driven systems.",
                },
                {
                    "dates": "Oct 2022 — Mar 2025",
                    "role": "Data Engineering - Manager",
                    "company": "GCash",
                    "description": "Led data engineering initiatives and team delivery for GCash's data platform.",
                },
                {
                    "dates": "Oct 2019 — Aug 2022",
                    "role": "Data and Analytics Developer",
                    "company": "Volt Bank",
                    "description": "Developed data and analytics solutions for financial services.",
                },
                {
                    "dates": "Jul 2018 — Sep 2019",
                    "role": "Team Lead - Teradata Database Administrator",
                    "company": "Teradata, Philippines",
                    "description": "Managed services offshore project with Delta Airlines.",
                },
                {
                    "dates": "Mar 2016 — Jul 2018",
                    "role": "Team Lead - Production Support",
                    "company": "Teradata",
                    "description": "Onshore project with Standard Chartered Bank.",
                },
                {
                    "dates": "Oct 2014 — Feb 2016",
                    "role": "Production Support Specialist",
                    "company": "Teradata",
                    "description": "Onshore project with Standard Chartered Bank.",
                },
                {
                    "dates": "Apr 2014 — Sep 2014",
                    "role": "ETL Developer",
                    "company": "Teradata",
                    "description": (
                        "Offshore project with Standard Chartered Bank. "
                        "Built ETL scripts including packaging, testing, and production deployment."
                    ),
                },
                {
                    "dates": "Jun 2012 — Mar 2014",
                    "role": "Production Support Specialist",
                    "company": "Teradata",
                    "description": "Onsite project with Globe Telecom. Ad-hoc queries, data loading, and report building.",
                },
                {
                    "dates": "Sep 2011 — Dec 2011",
                    "role": "Applications Developer II",
                    "company": "Federal Phoenix Assurance Co., Inc.",
                    "description": "Report development and system maintenance.",
                },
                {
                    "dates": "Jun 2008 — Aug 2011",
                    "role": "Applications Developer",
                    "company": "Transcom",
                    "description": "Application maintenance, scripting, and report building.",
                },
            ],
            "education": [
                {
                    "school": "University of the Philippines – IT Training Center",
                    "degree": "Certificate in IT – Applications Development",
                    "dates": "2007–2008",
                },
                {
                    "school": "University of Cebu",
                    "degree": "Bachelor of Science in Marine Transportation, Nautical Science",
                    "dates": "2001–2005",
                },
            ],
            "skills": [
                "Cloud Security",
                "Application Security",
                "Reliability Engineering",
                "Solutions Architecture",
                "Data Engineering",
                "Prompt Engineering",
                "AI-Assisted Development",
                "LLM Integration",
                "Generative AI",
            ],
            "languages": [{"name": "English", "level": 4}],
            "certifications": (
                "AWS Certified Solutions Architect – Associate · "
                "KCNA: Kubernetes and Cloud Native Associate · "
                "Teradata 12 Certified Professional · "
                "Teradata 12 SQL Certified"
            ),
            "awards": "",
            "additional": "",
            "template": "classic",
        }
