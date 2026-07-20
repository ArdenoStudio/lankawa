from setuptools import setup

setup(
    name="singer-emi-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Singer Sri Lanka EMI API (educational)",
    url="https://github.com/Cookie-Cat21/singer-emi-api-docs",
    packages=["singer_emi_api_docs"],
    package_dir={"singer_emi_api_docs": "singer_emi_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
