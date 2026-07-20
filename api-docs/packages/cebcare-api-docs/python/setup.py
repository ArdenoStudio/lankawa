from setuptools import setup

setup(
    name="cebcare-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for CEB Care API (educational)",
    url="https://github.com/Cookie-Cat21/cebcare-api-docs",
    packages=["cebcare_api_docs"],
    package_dir={"cebcare_api_docs": "cebcare_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
