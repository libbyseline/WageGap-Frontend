import pandas as pd
import polars as pl
import skimpy
import numpy as np
import os
import pathlib
import altair as alt
alt.data_transformers.enable('default', max_rows=None)
from altair import datum

def clean_wages():
    """
    Read in the data, clean it up
        Returns: 3 datasets, 2023 data, women in 2023, men in 2023
    """

    top10_wages = pl.read_csv('../data/clean_metro_wages.csv')


    top10_wages_ind = top10_wages.with_columns(
        pl.col('year').cast(str),
        pl.col('met2013').str.to_titlecase(),
        pl.col('sex').str.to_titlecase(), 
        pl.col("full_industry_name")
        .str.split_exact(": ", 1)
        .struct.rename_fields(["industry", "specific_job"])
        .alias("fields")
    ).unnest("fields"
    ).with_columns(pl.col("met2013")
        .str.split_exact(", ", 1)
        .struct.rename_fields(["metro", "state"])
        .alias("fields")
    ).unnest("fields"
    ).drop(['industry_title', 'sample', 'serial', 'cbserial', 'hhwt', \
        'cluster', 'strata', 'pernum', 'perwt', 'race', 'hispan', 'indnaics', 'gq']).filter( 
        (pl.col('industry') != 'Agriculture, Forestry, Fishing and Hunting') \
            # throwing out due to only 26 men and 13 women
            &  (pl.col('industry') != 'Management of Companies and Enterprises')
    )
        
    all_23 = top10_wages_ind.filter((pl.col('year') == "2023"))

    women_23 = top10_wages_ind.filter((pl.col('sex') == 'female') & (pl.col('year') == "2023"))

    men_23 = top10_wages_ind.filter((pl.col('sex') == 'male') & (pl.col('year') == "2023"))
        
    return all_23, women_23, men_23