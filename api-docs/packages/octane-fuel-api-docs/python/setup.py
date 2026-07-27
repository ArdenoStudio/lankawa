from setuptools import setup

setup(
    name="octane-fuel-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Octane Fuel API (educational)",
    url="https://github.com/Cookie-Cat21/octane-fuel-api-docs",
    packages=["octane_fuel_api_docs"],
    package_dir={"octane_fuel_api_docs": "octane_fuel_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
