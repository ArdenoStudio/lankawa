from setuptools import setup

setup(
    name="gdacs-firms-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for GDACS + NASA FIRMS (educational)",
    url="https://github.com/Cookie-Cat21/gdacs-firms-docs",
    packages=["gdacs_firms_docs"],
    package_dir={"gdacs_firms_docs": "gdacs_firms_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
