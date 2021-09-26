input_week=1
input_year=2010
input_type=2

while [ $input_week -lt 18 ]; do
  echo "Pulling games for $input_year week $input_week"
  command="node index.js $input_week $input_year $input_type 0"
  eval $command
  ((input_week+=1))
done