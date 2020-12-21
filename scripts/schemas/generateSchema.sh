function generateSchema() {
  local T_SM="$(tr '[:upper:]' '[:lower:]' <<< ${T:0:1})${T:1}"
  local S="${T_SM}.schema.ts"
  local OF="$OD$S"
  if [ -f "$OF" ]; then # dummy/previous file exists
    echo "Generating $S"
    npx ts-json-schema-generator --tsconfig "`pwd`/tsconfig.json" -p "$IF" -t "$T" > "${OF}_temp"
    sed -i "1 i export const ${T_SM}Schema = " "${OF}_temp"
    sed -i "2 a \ \ \"\$id\": \"$T_SM\"," "${OF}_temp"
    rm "$OF"
    mv "${OF}_temp" "$OF"
  else
    echo "Generating dummy $S" # generate dummy file to make the compiler happy
    echo "export const ${T}Schema = {};" > "$OF"
  fi
}
