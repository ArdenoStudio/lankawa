from setuptools import setup

setup(
    name="foodlk-api-docs-unofficial",
    version="0.1.0",
    description="Minimal unofficial HTTP helpers for FoodLK / Food Platform API (educational)",
    url="https://github.com/Cookie-Cat21/foodlk-api-docs",
    packages=["foodlk_api_docs"],
    package_dir={"foodlk_api_docs": "foodlk_api_docs"},
    install_requires=[],
    python_requires=">=3.11",
    license="MIT",
)
