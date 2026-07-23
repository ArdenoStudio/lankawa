from setuptools import setup

setup(
    name="metdept-cap-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Met Dept CAP / Advisories (educational)",
    url="https://github.com/Cookie-Cat21/metdept-cap-api-docs",
    packages=["metdept_cap_api_docs"],
    package_dir={"metdept_cap_api_docs": "metdept_cap_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
