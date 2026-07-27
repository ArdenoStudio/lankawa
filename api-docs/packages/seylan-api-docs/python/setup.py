from setuptools import setup

setup(
    name="seylan-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Seylan Bank API (educational)",
    url="https://github.com/Cookie-Cat21/seylan-api-docs",
    packages=["seylan_api_docs"],
    package_dir={"seylan_api_docs": "seylan_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
