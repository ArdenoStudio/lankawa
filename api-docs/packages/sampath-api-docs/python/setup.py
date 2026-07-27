from setuptools import setup

setup(
    name="sampath-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Sampath Bank API (educational)",
    url="https://github.com/Cookie-Cat21/sampath-api-docs",
    packages=["sampath_api_docs"],
    package_dir={"sampath_api_docs": "sampath_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
