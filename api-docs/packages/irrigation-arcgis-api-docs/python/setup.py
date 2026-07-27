from setuptools import setup

setup(
    name="irrigation-arcgis-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Irrigation ArcGIS Gauges (educational)",
    url="https://github.com/Cookie-Cat21/irrigation-arcgis-api-docs",
    packages=["irrigation_arcgis_api_docs"],
    package_dir={"irrigation_arcgis_api_docs": "irrigation_arcgis_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
