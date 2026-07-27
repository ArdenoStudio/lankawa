from setuptools import setup

setup(
    name="leco-outages-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for LECO Outage Notices (educational)",
    url="https://github.com/Cookie-Cat21/leco-outages-docs",
    packages=["leco_outages_docs"],
    package_dir={"leco_outages_docs": "leco_outages_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
