import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// AI Disclaimer: Used AI to learn how to export function(s) to html
// Notice the "export" keyword. This makes it public.
export function text_generator(div, data, user_income, user_sex, user_race) {
  // calculate greater than or less than
  const formatMoney = d3.format("$,.0f"); // Formula created with AI
  let msg = "";
  let opposite_sex = "";
  if (user_sex === "male") {
    opposite_sex = "female";
  } else {
    opposite_sex = "male";
  }

  // Basic messaging

  function less_or_more(
    user_income,
    p25_amt,
    avg_amt,
    p75_amt,
    sex,
    race,
    include_race
  ) {
    if (include_race === false) {
      if (user_income > p75_amt) {
        return `Your salary of ${formatMoney(
          user_income
        )} is greater than the 75% of ${sex}s' salaries. In 2023, 75% of ${sex}s in the top 10 metro areas made less than ${formatMoney(
          p75_amt
        )}`;
      } else if (user_income > avg_amt) {
        return `Your salary of ${formatMoney(
          user_income
        )} is greater than the average ${sex} salary among those who live in the top 10 metro areas, but less than 75% of those ${sex}s' salaries. In 2023, the average ${sex} salary was ${formatMoney(
          avg_amt
        )}, and 75% of those ${sex}s made less than ${formatMoney(p75_amt)}.`;
      } else if (user_income > p25_amt) {
        return `Your salary of ${formatMoney(
          user_income
        )} is less than the average ${sex} salary, but greater than 25% of ${sex}s' salaries. In 2023, the average ${sex} salary among those who live in the top 10 metro areas was ${formatMoney(
          avg_amt
        )}, and 25% of those ${sex}s made less than ${formatMoney(p25_amt)}.`;
      } else {
        return `Your salary of ${formatMoney(
          user_income
        )}is less than 25% of ${sex}s' salaries. In 2023, the average ${sex} salary among those who live in the top 10 metro areas was ${formatMoney(
          avg_amt
        )}, and 25% of those ${sex}s made less than ${formatMoney(p25_amt)}.`;
      }
    } else {
      let race_sex = race + " " + sex + "s";
      let race_sex_sing = race + " " + sex;
      if (race === "Two Or More Major Races") {
        race_sex = `${sex}s of ${race}`;
        race_sex_sing = `${sex} of ${race}`;
      } else if (race === "Other") {
        race_sex = `${sex}s of other race/ethnicity`;
        race_sex_sing = `${sex} of other race/ethnicity`;
      }
      if (user_income > p75_amt) {
        return `Your salary is greater than the 75% of ${race_sex}s' salaries. In 2023, 75% of ${race_sex} in the top 10 metro areas made less than ${formatMoney(
          p75_amt
        )}`;
      } else if (user_income > avg_amt) {
        return `Your salary is greater than the average ${race_sex_sing} salary, but less than 75% of ${race_sex}' salaries. In 2023, the average ${race_sex_sing} salary of those who live in the top 10 metro areas was ${formatMoney(
          avg_amt
        )}, and 75% of those ${race_sex} made less than ${formatMoney(
          p75_amt
        )}`;
      } else if (user_income > p25_amt) {
        return `Your salary is less than the average ${race_sex_sing}'s salary, but greater than 25% of ${race_sex}' salaries. In 2023, the average ${race_sex_sing}'s salary of those who live in the top 10 metro areas was ${formatMoney(
          avg_amt
        )}, and 25% of those ${race_sex} made less than ${formatMoney(
          p25_amt
        )}`;
      } else {
        return `Your salary is less than 25% of ${race_sex}s' salaries. In 2023, the average ${race_sex_sing}'s salary among those who live in the top 10 metro areas was ${formatMoney(
          avg_amt
        )}, and 25% of those ${race_sex} made less than ${formatMoney(
          p25_amt
        )}`;
      }
    }
  }

  // What's returned
  if (div === "text1") {
    let p25_amt_r1 = d3.max(data, (d) => d.p25);
    let p75_amt_r1 = d3.max(data, (d) => d.p75);
    let avg_amt_r1 = d3.max(data, (d) => d.avg);
    console.log(p75_amt_r1);
    return less_or_more(
      user_income,
      p25_amt_r1,
      avg_amt_r1,
      p75_amt_r1,
      user_sex,
      user_race,
      false
    );
  } else if (div === "text2") {
    let r2_data = data.filter((d) => d.sex === opposite_sex);
    let p25_amt_r2 = r2_data[0].p25;
    let avg_amt_r2 = r2_data[0].avg;
    let p75_amt_r2 = r2_data[0].p75;
    return less_or_more(
      user_income,
      p25_amt_r2,
      avg_amt_r2,
      p75_amt_r2,
      opposite_sex,
      user_race,
      false
    );
  } else if (div === "text3") {
    let r3_data = data.filter(
      (d) => d.sex === user_sex && d.race_ethnc_gen === user_race
    );
    let p25_amt_r3 = r3_data[0].p25;
    let avg_amt_r3 = r3_data[0].avg;
    let p75_amt_r3 = r3_data[0].p75;
    console.log("TEXT 3");
    return less_or_more(
      user_income,
      p25_amt_r3,
      avg_amt_r3,
      p75_amt_r3,
      user_sex,
      user_race,
      true
    );
  } else if (div === "text4") {
    let r4_data = data.filter(
      (d) => d.sex === opposite_sex && d.race_ethnc_gen === user_race
    );
    let p25_amt_r4 = r4_data[0].p25;
    let avg_amt_r4 = r4_data[0].avg;
    let p75_amt_r4 = r4_data[0].p75;
    return less_or_more(
      user_income,
      p25_amt_r4,
      avg_amt_r4,
      p75_amt_r4,
      opposite_sex,
      user_race,
      true
    );
  }
}
