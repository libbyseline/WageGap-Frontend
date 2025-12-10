import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// AI Disclaimer: Used AI to learn how to export function(s) to html
// Notice the "export" keyword. This makes it public.
export function text_generator(div, data, user_income) {
  // calculate greater than or less than
  const p25_amt = d3.max(data, (d) => d.p25);
  const p75_amt = d3.max(data, (d) => d.p75);
  const p50_amt = d3.max(data, (d) => d.avg);

  let dif_avg_and_user = user_income - p50_amt;
  let dif_p75_and_user = user_income - p75_amt;
  let dif_p25_and_user = user_income - p25_amt;

  //   let p75_msg = "";
  //   let p50_msg = "";
  //   let p25_msg = "";
  let msg = "";

  function less_or_more(user_income) {
    if (dif_p75_and_user > 0) {
      msg = `Your salary is greater than the 75th percentile`;
    } else if (dif_avg_and_user > 0) {
      msg = "Your salary is greater than the average income.";
    } else if (dif_p25_and_user > 0) {
      msg = "Your salary is greater than the 25th percentile.";
    } else {
      ("Your salary is less than the 25th percentile.");
    }
    return msg;
  }

  //   let message = "";
  //   if (div === "text1") {
  //     message = "1";
  //   } else if (div === "text2") {
  //     message = "2";
  //   } else if (div === "text3") {
  //     message = "3";
  //   } else if (div === "text4") {
  //     message = "4";

  return less_or_more(user_income);
}
