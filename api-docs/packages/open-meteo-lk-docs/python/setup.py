from setuptools import setup

setup(
    name="open-meteo-lk-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for Open-Meteo Sri Lanka Recipes (educational)",
    url="https://github.com/Cookie-Cat21/open-meteo-lk-docs",
    packages=["open_meteo_lk_docs"],
    package_dir={"open_meteo_lk_docs": "open_meteo_lk_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
